import os
import re
import time
from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse

import httpx
from dotenv import load_dotenv

from services import bias_service, scraper_service

load_dotenv()

NEWS_API_KEY = os.getenv("NEWS_API_KEY")
NEWS_API_BASE = "https://newsapi.org/v2"

VALID_CATEGORIES = [
    "politics",
    "business",
    "entertainment",
    "general",
    "health",
    "science",
    "sports",
    "technology",
]

# External API calls are capped to once every 4 hours per unique request
CACHE_TTL_SECONDS = 4 * 60 * 60
_ARTICLE_CACHE: dict[str, tuple[float, list[dict]]] = {}

MAINSTREAM_DOMAINS = {
    "apnews.com",
    "reuters.com",
    "bbc.com",
    "bbc.co.uk",
    "abcnews.go.com",
    "cbsnews.com",
    "nbcnews.com",
    "cnn.com",
    "nytimes.com",
    "washingtonpost.com",
    "wsj.com",
    "usatoday.com",
    "bloomberg.com",
    "forbes.com",
    "npr.org",
    "time.com",
}

INDEPENDENT_POLITICS_DOMAINS = {
    "thehill.com",
    "politico.com",
    "readtangle.com",
    "reason.com",
    "realclearpolitics.com",
    "nationalreview.com",
    "thefederalist.com",
    "motherjones.com",
    "jacobin.com",
    "theintercept.com",
    "dailycaller.com",
    "washingtonexaminer.com",
}

POLITICS_QUERY = (
    "politics OR election OR congress OR senate OR parliament OR "
    "white house OR government OR policy OR supreme court"
)


def _extract_domain(url: str) -> str:
    parsed = urlparse(url)
    host = parsed.netloc.lower()
    if host.startswith("www."):
        host = host[4:]
    return host


def _resolve_bias(
    url: str, text: str | None = None
) -> tuple[str | None, float | None]:
    domain = _extract_domain(url) if url else None
    return bias_service.predict_bias(text=text, domain=domain)


def _cache_get(key: str) -> list[dict] | None:
    cached = _ARTICLE_CACHE.get(key)
    if not cached:
        return None

    expires_at, articles = cached
    if expires_at <= time.time():
        _ARTICLE_CACHE.pop(key, None)
        return None
    return articles


def _cache_set(key: str, articles: list[dict]) -> None:
    _ARTICLE_CACHE[key] = (time.time() + CACHE_TTL_SECONDS, articles)


def _is_recent_enough(published_at: str | None, max_age_hours: int = 48) -> bool:
    """Keep feed focused on currently trending coverage."""
    if not published_at:
        return False
    try:
        published_dt = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
    except ValueError:
        return False

    if published_dt.tzinfo is None:
        published_dt = published_dt.replace(tzinfo=timezone.utc)

    cutoff = datetime.now(timezone.utc) - timedelta(hours=max_age_hours)
    return published_dt >= cutoff


def _to_iso_datetime(value: str | None) -> str | None:
    if not value:
        return None

    cleaned = value.strip()
    try:
        return datetime.fromisoformat(cleaned.replace("Z", "+00:00")).isoformat()
    except ValueError:
        pass

    rel = re.match(
        r"^(?P<num>\d+)\s+(?P<unit>minute|minutes|hour|hours|day|days|week|weeks)\s+ago$",
        cleaned.lower(),
    )
    if not rel:
        return None

    amount = int(rel.group("num"))
    unit = rel.group("unit")
    if "minute" in unit:
        delta = timedelta(minutes=amount)
    elif "hour" in unit:
        delta = timedelta(hours=amount)
    elif "day" in unit:
        delta = timedelta(days=amount)
    else:
        delta = timedelta(weeks=amount)
    return (datetime.now(timezone.utc) - delta).isoformat()


def _search_news(query: str, page_size: int, sort_by: str = "relevancy") -> list[dict]:
    if not NEWS_API_KEY:
        raise RuntimeError("NEWS_API_KEY is not set in .env")
    params = {
        "apiKey": NEWS_API_KEY,
        "q": query,
        "language": "en",
        "sortBy": sort_by,
        "searchIn": "title,description",
        "pageSize": min(max(page_size, 10), 100),
        "page": 1,
    }
    with httpx.Client(timeout=10.0) as client:
        response = client.get(f"{NEWS_API_BASE}/everything", params=params)
        response.raise_for_status()
        data = response.json()
    return data.get("articles", [])


def _source_priority(article: dict) -> int:
    """Rank mainstream + independent politics sources ahead of others."""
    domain = _extract_domain(article.get("url") or "")
    if domain in MAINSTREAM_DOMAINS:
        return 3
    if domain in INDEPENDENT_POLITICS_DOMAINS:
        return 2
    return 1


def _published_sort_key(article: dict) -> str:
    # ISO timestamps sort lexicographically when normalized.
    return article.get("published_at") or ""


def _shape_article(raw: dict, category: str = "general") -> dict:
    """
    Convert a NewsAPI article into our row shape, WITHOUT classifying bias.
    Bias is filled in by `_classify_articles` after the (optional) scrape pass,
    so the model can read full body text instead of NewsAPI's truncated snippet.
    """
    published_at = raw.get("publishedAt")
    if published_at:
        try:
            published_at = datetime.fromisoformat(
                published_at.replace("Z", "+00:00")
            ).isoformat()
        except ValueError:
            published_at = None

    source_name = raw.get("source", {}).get("name", "Unknown")

    return {
        "title": raw.get("title") or "Untitled",
        "source": source_name,
        "summary": raw.get("description"),
        "content": raw.get("content"),  # may be replaced by scraped body below
        "url": raw.get("url"),
        "image_url": raw.get("urlToImage"),
        "category": category,
        "sentiment": "neutral",  # placeholder until the sentiment model is integrated
        "bias": None,
        "bias_confidence": None,
        "published_at": published_at,
    }


# Articles whose scraped body falls below this length are treated as a failed
# scrape (paywall stub, "JavaScript required" page, etc.) — we'd rather fall
# back to NewsAPI's snippet than feed the model a useless 50-char placeholder.
_MIN_SCRAPED_BODY = 400


def _classify_articles(rows: list[dict]) -> list[dict]:
    """
    Scrape each article URL concurrently, then run the bias model on the
    enriched (scraped or fallback) text. Mutates `rows` in place and returns it.
    """
    if not rows:
        return rows

    urls = [r.get("url") for r in rows if r.get("url")]
    try:
        scraped_map = scraper_service.scrape_many(urls) if urls else {}
    except Exception as exc:
        # A scraper-wide failure (e.g. httpx import error) shouldn't block
        # ingestion — fall back to NewsAPI snippets for the whole batch.
        print(f"news_service: bulk scrape failed ({exc}) — using NewsAPI snippets")
        scraped_map = {}

    for row in rows:
        url = row.get("url") or ""
        scraped = scraped_map.get(url)
        scraped_body = (scraped or {}).get("content") if scraped else None

        if scraped_body and len(scraped_body) >= _MIN_SCRAPED_BODY:
            # Promote the longer scraped body so the model — and the article
            # detail view downstream — sees real content, not "[+1234 chars]".
            row["content"] = scraped_body
            text_for_bias = " ".join(
                filter(None, [row.get("title"), row.get("summary"), scraped_body])
            )
        else:
            text_for_bias = " ".join(
                filter(None, [row.get("title"), row.get("summary"), row.get("content")])
            )

        bias, conf = _resolve_bias(url, text=text_for_bias or None)
        row["bias"] = bias
        row["bias_confidence"] = conf

    return rows


def _parse_article(raw: dict, category: str = "general") -> dict:
    """
    Backward-compatible single-article entry point. Shapes the row, runs
    a (single-URL) scrape pass through scrape_many, then classifies. Most
    callers should batch through _shape_article + _classify_articles instead
    so scraping happens concurrently across the whole batch.
    """
    row = _shape_article(raw, category)
    _classify_articles([row])
    return row


def fetch_top_headlines(
    category: str = "general",
    country: str = "us",
    page_size: int = 20,
) -> list[dict]:
    if not NEWS_API_KEY:
        raise RuntimeError("NEWS_API_KEY is not set in .env")

    if category not in VALID_CATEGORIES:
        category = "general"

    if category == "politics":
        return fetch_politics_headlines(page_size=page_size)

    cache_key = f"top:{category}:{country}:{page_size}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    params = {
        "apiKey": NEWS_API_KEY,
        "country": country,
        "category": category,
        # Pull a wider candidate set, then rank by source focus + freshness.
        "pageSize": min(max(page_size * 3, 30), 100),
        "page": 1,
    }

    with httpx.Client(timeout=10.0) as client:
        response = client.get(f"{NEWS_API_BASE}/top-headlines", params=params)
        response.raise_for_status()
        data = response.json()

    articles = data.get("articles", [])
    articles = [
        a
        for a in articles
        if a.get("url")
        and a.get("title") != "[Removed]"
        and _is_recent_enough(a.get("publishedAt"))
    ]
    parsed = [_shape_article(a, category) for a in articles]
    parsed.sort(key=lambda a: (_source_priority(a), _published_sort_key(a)), reverse=True)
    # Trim to the requested size BEFORE scraping so we don't waste outbound
    # requests on candidates we'll discard.
    parsed = parsed[:page_size]
    _classify_articles(parsed)
    _cache_set(cache_key, parsed)
    return parsed


def fetch_politics_headlines(page_size: int = 20) -> list[dict]:
    if not NEWS_API_KEY:
        raise RuntimeError("NEWS_API_KEY is not set in .env")

    cache_key = f"politics:{page_size}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    articles = _search_news(
        query=POLITICS_QUERY,
        page_size=min(max(page_size * 3, 30), 100),
        sort_by="publishedAt",
    )
    articles = [
        a
        for a in articles
        if a.get("url")
        and a.get("title") != "[Removed]"
        and _is_recent_enough(a.get("publishedAt"))
    ]
    parsed = [_shape_article(a, "politics") for a in articles]
    parsed.sort(key=lambda a: (_source_priority(a), _published_sort_key(a)), reverse=True)
    parsed = parsed[:page_size]
    _classify_articles(parsed)
    _cache_set(cache_key, parsed)
    return parsed


def fetch_everything(
    query: str,
    language: str = "en",
    page_size: int = 20,
    sort_by: str = "publishedAt",
) -> list[dict]:
    if not NEWS_API_KEY:
        raise RuntimeError("NEWS_API_KEY is not set in .env")

    cache_key = f"search:{query}:{language}:{page_size}:{sort_by}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    articles = _search_news(query=query, page_size=page_size, sort_by=sort_by)
    articles = [a for a in articles if a.get("url") and a.get("title") != "[Removed]"]
    parsed = [_shape_article(a, "general") for a in articles]
    _classify_articles(parsed)
    _cache_set(cache_key, parsed)
    return parsed


def fetch_related_topic(
    query: str,
    category: str = "general",
    page_size: int = 24,
    max_age_hours: int = 120,
) -> list[dict]:
    """Fetch topic-related coverage with stronger relevance and source diversity."""
    if not NEWS_API_KEY:
        raise RuntimeError("NEWS_API_KEY is not set in .env")

    normalized_query = query.strip()
    if not normalized_query:
        return []

    cache_key = f"related:{normalized_query}:{category}:{page_size}:{max_age_hours}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    search_query = normalized_query
    if category == "politics":
        search_query = f"({normalized_query}) AND ({POLITICS_QUERY})"

    raw_articles = _search_news(
        query=search_query,
        page_size=min(max(page_size * 4, 40), 100),
        sort_by="relevancy",
    )
    raw_articles = [
        a
        for a in raw_articles
        if a.get("url")
        and a.get("title")
        and a.get("title") != "[Removed]"
        and _is_recent_enough(a.get("publishedAt"), max_age_hours=max_age_hours)
    ]

    # Shape only — scraping is deferred until AFTER selection so we don't
    # spend outbound requests on articles we're going to drop.
    parsed = [_shape_article(a, category) for a in raw_articles]
    parsed.sort(key=lambda a: (_source_priority(a), _published_sort_key(a)), reverse=True)

    # First pass: maximize unique-source coverage for topic comparison.
    selected: list[dict] = []
    seen_domains: set[str] = set()
    for article in parsed:
        domain = _extract_domain(article.get("url") or "")
        if not domain or domain in seen_domains:
            continue
        seen_domains.add(domain)
        selected.append(article)
        if len(selected) >= page_size:
            break

    # Second pass: fill remaining slots by best-ranked leftovers.
    if len(selected) < page_size:
        used_urls = {a.get("url") for a in selected}
        for article in parsed:
            if article.get("url") in used_urls:
                continue
            selected.append(article)
            if len(selected) >= page_size:
                break

    _classify_articles(selected)
    _cache_set(cache_key, selected)
    return selected
