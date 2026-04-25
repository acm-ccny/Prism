import os
import json
import re
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse

import httpx
from dotenv import load_dotenv

load_dotenv()

NEWS_API_KEY = os.getenv("NEWS_API_KEY")
NEWS_API_BASE = "https://newsapi.org/v2"
SERPAPI_KEY = os.getenv("SERPAPI_KEY")
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")
SERPAPI_BASE = "https://serpapi.com/search.json"
GNEWS_BASE = "https://gnews.io/api/v4/search"

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

SOURCE_BIAS_PATH = Path(__file__).resolve().parent.parent / "data" / "source_bias.json"

with SOURCE_BIAS_PATH.open("r", encoding="utf-8") as file:
    _SOURCE_BIAS_DATA = json.load(file)

SOURCE_BIAS_LOOKUP = {
    domain: value
    for domain, value in _SOURCE_BIAS_DATA.items()
    if not domain.startswith("_")
}

CACHE_TTL_SECONDS = 180
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


def _resolve_bias(url: str) -> tuple[str | None, float | None]:
    domain = _extract_domain(url)
    if not domain:
        return None, None

    candidates = [domain]
    parts = domain.split(".")
    if len(parts) > 2:
        candidates.append(".".join(parts[-2:]))

    for candidate in candidates:
        match = SOURCE_BIAS_LOOKUP.get(candidate)
        if match:
            return match.get("bias"), 0.9
    return None, None


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
    """Search news with SerpApi/GNews first, then fallback to NewsAPI."""
    if SERPAPI_KEY:
        params = {
            "engine": "google_news",
            "q": query,
            "hl": "en",
            "gl": "us",
            "num": min(max(page_size, 10), 100),
            "api_key": SERPAPI_KEY,
        }
        with httpx.Client(timeout=10.0) as client:
            response = client.get(SERPAPI_BASE, params=params)
            response.raise_for_status()
            data = response.json()

        results = data.get("news_results", [])
        mapped = []
        for item in results:
            mapped.append(
                {
                    "title": item.get("title"),
                    "description": item.get("snippet"),
                    "content": item.get("snippet"),
                    "url": item.get("link"),
                    "urlToImage": item.get("thumbnail"),
                    "publishedAt": _to_iso_datetime(item.get("date")),
                    "source": {"name": (item.get("source") or {}).get("name", "Unknown")},
                }
            )
        return mapped

    if GNEWS_API_KEY:
        params = {
            "q": query,
            "lang": "en",
            "country": "us",
            "max": min(max(page_size, 10), 100),
            "apikey": GNEWS_API_KEY,
        }
        with httpx.Client(timeout=10.0) as client:
            response = client.get(GNEWS_BASE, params=params)
            response.raise_for_status()
            data = response.json()

        results = data.get("articles", [])
        mapped = []
        for item in results:
            mapped.append(
                {
                    "title": item.get("title"),
                    "description": item.get("description"),
                    "content": item.get("content"),
                    "url": item.get("url"),
                    "urlToImage": item.get("image"),
                    "publishedAt": _to_iso_datetime(item.get("publishedAt")),
                    "source": {"name": (item.get("source") or {}).get("name", "Unknown")},
                }
            )
        return mapped

    if not NEWS_API_KEY:
        raise RuntimeError("Set SERPAPI_KEY or GNEWS_API_KEY (or NEWS_API_KEY fallback) in .env")

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


def _parse_article(raw: dict, category: str = "general") -> dict:
    """Convert a NewsAPI article into our article schema."""
    published_at = raw.get("publishedAt")
    if published_at:
        try:
            published_at = datetime.fromisoformat(
                published_at.replace("Z", "+00:00")
            ).isoformat()
        except ValueError:
            published_at = None

    source_name = raw.get("source", {}).get("name", "Unknown")
    article_url = raw.get("url")
    bias, bias_confidence = _resolve_bias(article_url) if article_url else (None, None)

    return {
        "title": raw.get("title") or "Untitled",
        "source": source_name,
        "summary": raw.get("description"),
        "content": raw.get("content"),
        "url": raw.get("url"),
        "image_url": raw.get("urlToImage"),
        "category": category,
        "sentiment": "neutral",  # placeholder until the ML model is integrated
        "bias": bias,
        "bias_confidence": bias_confidence,
        "published_at": published_at,
    }


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
    parsed = [_parse_article(a, category) for a in articles]
    parsed.sort(key=lambda a: (_source_priority(a), _published_sort_key(a)), reverse=True)
    parsed = parsed[:page_size]
    _cache_set(cache_key, parsed)
    return parsed


def fetch_politics_headlines(page_size: int = 20) -> list[dict]:
    if not (SERPAPI_KEY or GNEWS_API_KEY or NEWS_API_KEY):
        raise RuntimeError("Set SERPAPI_KEY or GNEWS_API_KEY (or NEWS_API_KEY fallback) in .env")

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
    parsed = [_parse_article(a, "politics") for a in articles]
    parsed.sort(key=lambda a: (_source_priority(a), _published_sort_key(a)), reverse=True)
    parsed = parsed[:page_size]
    _cache_set(cache_key, parsed)
    return parsed


def fetch_everything(
    query: str,
    language: str = "en",
    page_size: int = 20,
    sort_by: str = "publishedAt",
) -> list[dict]:
    if not (SERPAPI_KEY or GNEWS_API_KEY or NEWS_API_KEY):
        raise RuntimeError("Set SERPAPI_KEY or GNEWS_API_KEY (or NEWS_API_KEY fallback) in .env")

    cache_key = f"search:{query}:{language}:{page_size}:{sort_by}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    articles = _search_news(query=query, page_size=page_size, sort_by=sort_by)
    articles = [a for a in articles if a.get("url") and a.get("title") != "[Removed]"]
    parsed = [_parse_article(a, "general") for a in articles]
    _cache_set(cache_key, parsed)
    return parsed


def fetch_related_topic(
    query: str,
    category: str = "general",
    page_size: int = 24,
    max_age_hours: int = 120,
) -> list[dict]:
    """Fetch topic-related coverage with stronger relevance and source diversity."""
    if not (SERPAPI_KEY or GNEWS_API_KEY or NEWS_API_KEY):
        raise RuntimeError("Set SERPAPI_KEY or GNEWS_API_KEY (or NEWS_API_KEY fallback) in .env")

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

    parsed = [_parse_article(a, category) for a in raw_articles]
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
            _cache_set(cache_key, selected)
            return selected

    # Second pass: fill remaining slots by best-ranked leftovers.
    if len(selected) < page_size:
        used_urls = {a.get("url") for a in selected}
        for article in parsed:
            if article.get("url") in used_urls:
                continue
            selected.append(article)
            if len(selected) >= page_size:
                break

    _cache_set(cache_key, selected)
    return selected
