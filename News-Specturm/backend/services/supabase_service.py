import os
import re
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Optional
from models.article import Article, ArticleCreate

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

_client: Optional[Client] = None


def get_client() -> Client:
    """Return a Supabase client.

    Prefers the service role key (bypasses RLS) so upserts work without
    needing permissive RLS policies. Falls back to the anon key for
    local development when the service role key is not yet configured.
    """
    global _client
    if _client is None:
        key = SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY
        if not SUPABASE_URL or not key:
            raise RuntimeError(
                "SUPABASE_URL and at least one of SUPABASE_SERVICE_ROLE_KEY / "
                "SUPABASE_ANON_KEY must be set in .env"
            )
        if not SUPABASE_SERVICE_ROLE_KEY:
            print(
                "WARNING: SUPABASE_SERVICE_ROLE_KEY not set — using anon key. "
                "Writes will be subject to RLS policies."
            )
        _client = create_client(SUPABASE_URL, key)
    return _client


def get_articles(
    category: Optional[str] = None,
    sentiment: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[dict], int]:
    """Return (rows, total_count). Total reflects filters but ignores limit/offset."""
    client = get_client()
    query = (
        client.table("articles")
        .select("*", count="exact")
        .order("published_at", desc=True)
        .range(offset, offset + limit - 1)
    )

    if category:
        query = query.eq("category", category)
    if sentiment:
        query = query.eq("sentiment", sentiment)
    if search:
        # Whole-word, case-insensitive match. `\y` is Postgres' word boundary —
        # so a query for "ai" matches "AI" / " ai " but NOT "paid" or "said".
        # We escape regex metacharacters in the user term, then split on
        # whitespace so multi-word queries match each token (AND semantics
        # would need .and_(); we keep OR-of-fields here, AND across terms).
        terms = [t for t in re.split(r"\s+", search.strip()) if t]
        if terms:
            def _term_clause(term: str) -> str:
                escaped = re.escape(term)
                # PostgREST `or_` tokenizes on commas and parens — escape them
                # inside the regex with a backslash so the filter parses cleanly.
                escaped = escaped.replace(",", r"\,").replace("(", r"\(").replace(")", r"\)")
                pattern = rf"\y{escaped}\y"
                return (
                    f"title.imatch.{pattern},"
                    f"summary.imatch.{pattern},"
                    f"source.imatch.{pattern}"
                )

            # Each term gets its own OR-group across the three columns; we AND
            # the term groups together so a 2-word query narrows results.
            for term in terms:
                query = query.or_(_term_clause(term))

    response = query.execute()
    return response.data or [], response.count or 0


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
