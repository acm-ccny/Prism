import asyncio
import time
from urllib.parse import urlparse
from typing import Optional


def scrape_article(url: str) -> dict:
    """
    Fetch article content from a URL.
    Tries Selenium (full JS rendering) first; falls back to httpx + BeautifulSoup.
    """
    try:
        return _scrape_with_selenium(url)
    except Exception as exc:
        print(f"scraper_service: selenium failed ({exc}), falling back to httpx")
        return _scrape_with_httpx(url)


def _scrape_with_selenium(url: str) -> dict:
    from selenium import webdriver  # type: ignore
    from selenium.webdriver.chrome.options import Options  # type: ignore
    from selenium.webdriver.chrome.service import Service  # type: ignore
    from selenium.webdriver.common.by import By  # type: ignore
    from selenium.webdriver.support.ui import WebDriverWait  # type: ignore
    from selenium.webdriver.support import expected_conditions as EC  # type: ignore
    from webdriver_manager.chrome import ChromeDriverManager  # type: ignore
    from bs4 import BeautifulSoup  # type: ignore

    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1280,800")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options,
    )
    try:
        driver.get(url)
        WebDriverWait(driver, 12).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        time.sleep(1.5)
        html = driver.page_source
    finally:
        driver.quit()

    return _parse_html(html, url)


def _scrape_with_httpx(url: str) -> dict:
    import httpx  # type: ignore
    from bs4 import BeautifulSoup  # type: ignore

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
    }
    with httpx.Client(timeout=15.0, follow_redirects=True, headers=headers) as client:
        response = client.get(url)
        response.raise_for_status()
        html = response.text

    return _parse_html(html, url)


def _parse_html(html: str, url: str) -> dict:
    from bs4 import BeautifulSoup  # type: ignore

    soup = BeautifulSoup(html, "lxml")

    for tag in soup(["script", "style", "nav", "footer", "aside", "iframe"]):
        tag.decompose()

    # Title: OG tag → <h1> → <title>
    title: Optional[str] = None
    og_title = soup.find("meta", property="og:title")
    if og_title and og_title.get("content"):  # type: ignore[union-attr]
        title = str(og_title["content"]).strip()
    if not title:
        h1 = soup.find("h1")
        if h1:
            title = h1.get_text(strip=True)
    if not title and soup.title:
        title = soup.title.get_text(strip=True)

    # Summary
    summary: Optional[str] = None
    og_desc = soup.find("meta", property="og:description")
    if og_desc and og_desc.get("content"):  # type: ignore[union-attr]
        summary = str(og_desc["content"]).strip()
    if not summary:
        meta_desc = soup.find("meta", attrs={"name": "description"})
        if meta_desc and meta_desc.get("content"):  # type: ignore[union-attr]
            summary = str(meta_desc["content"]).strip()

    # Image
    image_url: Optional[str] = None
    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):  # type: ignore[union-attr]
        image_url = str(og_image["content"]).strip()

    # Source
    parsed = urlparse(url)
    source = parsed.netloc.lstrip("www.")

    # Article body: prefer <article>, otherwise collect <p> tags
    article_tag = soup.find("article")
    if article_tag:
        content = " ".join(article_tag.get_text(separator=" ", strip=True).split())
    else:
        paragraphs = [
            p.get_text(strip=True)
            for p in soup.find_all("p")
            if len(p.get_text(strip=True)) > 40
        ]
        content = " ".join(paragraphs)

    # 5 000-char cap so bias inference stays fast
    content = content[:5000]

    return {
        "title": title or "Untitled",
        "source": source,
        "summary": summary,
        "content": content,
        "url": url,
        "image_url": image_url,
    }


# ── Async bulk scraping ──────────────────────────────────────────────
# Used by news_service when ingesting a NewsAPI batch. httpx-only — Selenium
# is fine for one-off /analyze-url calls but unusable at 100 URLs/request.

_BULK_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

# Per-host concurrency cap. Many news sites rate-limit per-IP; 8 in flight is
# a safe default that still gives a decent speedup on a 50-100 URL batch.
_BULK_CONCURRENCY = 8
_BULK_TIMEOUT = 8.0


async def _fetch_one(client: "httpx.AsyncClient", url: str) -> Optional[str]:  # noqa: F821
    try:
        resp = await client.get(url, timeout=_BULK_TIMEOUT)
        resp.raise_for_status()
        ctype = resp.headers.get("content-type", "")
        if "html" not in ctype.lower():
            return None
        return resp.text
    except Exception:
        return None


async def scrape_many_async(urls: list[str]) -> dict[str, dict]:
    """
    Fetch + parse many article URLs concurrently. Returns a {url: scraped_dict}
    map. URLs that error out (timeout, blocked, paywalled, non-HTML) are simply
    omitted — the caller falls back to NewsAPI's snippet for those.
    """
    import httpx  # type: ignore

    if not urls:
        return {}

    # Dedupe while preserving order — a single batch sometimes has the same URL
    # twice if NewsAPI mirrors it across categories.
    seen: set[str] = set()
    unique_urls: list[str] = []
    for u in urls:
        if u and u not in seen:
            seen.add(u)
            unique_urls.append(u)

    sem = asyncio.Semaphore(_BULK_CONCURRENCY)
    results: dict[str, dict] = {}

    async with httpx.AsyncClient(
        timeout=_BULK_TIMEOUT,
        follow_redirects=True,
        headers=_BULK_HEADERS,
        # http2 trims handshake cost on multi-request hosts, but several news
        # sites mishandle it — leave it off for compatibility.
    ) as client:

        async def worker(u: str) -> None:
            async with sem:
                html = await _fetch_one(client, u)
            if not html:
                return
            try:
                # _parse_html is CPU-bound (BeautifulSoup) but small per article.
                # Running it inline keeps the implementation simple; if profiles
                # show it dominating, push it onto a thread pool.
                results[u] = _parse_html(html, u)
            except Exception:
                pass

        await asyncio.gather(*(worker(u) for u in unique_urls))

    return results


def scrape_many(urls: list[str]) -> dict[str, dict]:
    """
    Sync wrapper around scrape_many_async. Safe to call from FastAPI's
    sync endpoints — uses asyncio.run when no loop exists.
    """
    if not urls:
        return {}
    try:
        return asyncio.run(scrape_many_async(urls))
    except RuntimeError:
        # We're already inside a running loop (rare for sync FastAPI handlers).
        # Fall back to a fresh loop in this thread.
        loop = asyncio.new_event_loop()
        try:
            return loop.run_until_complete(scrape_many_async(urls))
        finally:
            loop.close()
