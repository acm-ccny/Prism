import os
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Optional
from models.article import Article, ArticleCreate

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

_client: Optional[Client] = None


def get_client() -> Client:
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env"
            )
        _client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _client


def get_articles(
    category: Optional[str] = None,
    sentiment: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
) -> list[dict]:
    client = get_client()
    query = client.table("articles").select("*").order("published_at", desc=True).limit(limit)

    if category:
        query = query.eq("category", category)
    if sentiment:
        query = query.eq("sentiment", sentiment)
    if search:
        query = query.ilike("title", f"%{search}%")

    response = query.execute()
    return response.data or []


def get_article_by_id(article_id: str) -> Optional[dict]:
    client = get_client()
    response = (
        client.table("articles").select("*").eq("id", article_id).single().execute()
    )
    return response.data


def upsert_articles(articles: list[dict]) -> list[dict]:
    """Insert articles, ignoring duplicates by URL."""
    client = get_client()
    response = (
        client.table("articles")
        .upsert(articles, on_conflict="url", ignore_duplicates=True)
        .execute()
    )
    return response.data or []


def create_article(article: ArticleCreate) -> Optional[dict]:
    client = get_client()
    response = (
        client.table("articles").insert(article.model_dump(exclude_none=True)).execute()
    )
    return response.data[0] if response.data else None
