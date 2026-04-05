from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from models.article import Article, ArticleCreate, ArticlesResponse
from services import supabase_service, news_service

router = APIRouter()


@router.get("", response_model=ArticlesResponse)
def get_articles(
    category: Optional[str] = Query(None, description="Filter by category"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment"),
    search: Optional[str] = Query(None, description="Search in article titles"),
    limit: int = Query(50, ge=1, le=200),
):
    """Return articles stored in Supabase, with optional filters."""
    try:
        rows = supabase_service.get_articles(
            category=category,
            sentiment=sentiment,
            search=search,
            limit=limit,
        )
        articles = [Article(**row) for row in rows]
        return ArticlesResponse(data=articles, total=len(articles))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/fetch-news", response_model=ArticlesResponse)
def fetch_and_store_news(
    category: str = Query("general", description="NewsAPI category to fetch"),
    country: str = Query("us", description="Country code"),
    page_size: int = Query(20, ge=1, le=100),
):
    """
    Fetch fresh articles from NewsAPI, upsert them into Supabase,
    and return the fetched articles.
    """
    try:
        raw_articles = news_service.fetch_top_headlines(
            category=category,
            country=country,
            page_size=page_size,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"NewsAPI error: {str(e)}")

    if not raw_articles:
        return ArticlesResponse(data=[], total=0)

    try:
        supabase_service.upsert_articles(raw_articles)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    articles = [Article(**a) for a in raw_articles]
    return ArticlesResponse(data=articles, total=len(articles))


@router.get("/{article_id}", response_model=Article)
def get_article(article_id: str):
    """Return a single article by its UUID."""
    try:
        row = supabase_service.get_article_by_id(article_id)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    if not row:
        raise HTTPException(status_code=404, detail="Article not found")
    return Article(**row)


@router.post("", response_model=Article, status_code=201)
def create_article(article: ArticleCreate):
    """Manually add a single article to Supabase."""
    try:
        row = supabase_service.create_article(article)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    if not row:
        raise HTTPException(status_code=500, detail="Failed to create article")
    return Article(**row)
