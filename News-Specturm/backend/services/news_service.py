import os
import httpx
from dotenv import load_dotenv
from datetime import datetime, timezone
from typing import Optional

load_dotenv()

NEWS_API_KEY = os.getenv("NEWS_API_KEY")
NEWS_API_BASE = "https://newsapi.org/v2"

# Map NewsAPI categories to our categories
VALID_CATEGORIES = [
    "business",
    "entertainment",
    "general",
    "health",
    "science",
    "sports",
    "technology",
]


def _parse_article(raw: dict, category: str = "general") -> dict:
    """Convert a raw NewsAPI article into our article schema."""
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
        "content": raw.get("content"),
        "url": raw.get("url"),
        "image_url": raw.get("urlToImage"),
        "category": category,
        "sentiment": "neutral",  # placeholder until the ML model is integrated
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

    params = {
        "apiKey": NEWS_API_KEY,
        "country": country,
        "category": category,
        "pageSize": page_size,
    }

    with httpx.Client(timeout=10.0) as client:
        response = client.get(f"{NEWS_API_BASE}/top-headlines", params=params)
        response.raise_for_status()
        data = response.json()

    articles = data.get("articles", [])
    # Filter out articles with [Removed] titles or missing URLs
    articles = [
        a for a in articles if a.get("url") and a.get("title") != "[Removed]"
    ]
    return [_parse_article(a, category) for a in articles]


def fetch_everything(
    query: str,
    language: str = "en",
    page_size: int = 20,
    sort_by: str = "publishedAt",
) -> list[dict]:
    if not NEWS_API_KEY:
        raise RuntimeError("NEWS_API_KEY is not set in .env")

    params = {
        "apiKey": NEWS_API_KEY,
        "q": query,
        "language": language,
        "pageSize": page_size,
        "sortBy": sort_by,
    }

    with httpx.Client(timeout=10.0) as client:
        response = client.get(f"{NEWS_API_BASE}/everything", params=params)
        response.raise_for_status()
        data = response.json()

    articles = data.get("articles", [])
    articles = [
        a for a in articles if a.get("url") and a.get("title") != "[Removed]"
    ]
    return [_parse_article(a, "general") for a in articles]
