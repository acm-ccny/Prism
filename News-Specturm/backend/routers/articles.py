from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from models.article import Article, ArticleCreate, ArticlesResponse
from services import supabase_service, news_service, scraper_service, bias_service

router = APIRouter()


@router.get("", response_model=ArticlesResponse)
def get_articles(
    category: Optional[str] = Query(None, description="Filter by category"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment"),
    search: Optional[str] = Query(None, description="Search in article titles and summaries"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """Return articles stored in Supabase, with optional filters and pagination."""
    try:
        rows, total = supabase_service.get_articles(
            category=category,
            sentiment=sentiment,
            search=search,
            limit=limit,
            offset=offset,
        )
        articles = [Article(**row) for row in rows]
        return ArticlesResponse(data=articles, total=total)
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
    """Fetch fresh articles from NewsAPI, upsert them into Supabase, and return them."""
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


@router.get("/live", response_model=ArticlesResponse)
def get_live_articles(
    category: str = Query("general", description="NewsAPI category"),
    page_size: int = Query(20, ge=1, le=100),
):
    """Fetch fresh articles from NewsAPI, store them, and return them."""
    try:
        raw = news_service.fetch_top_headlines(
            category=category,
            page_size=page_size,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"NewsAPI error: {str(e)}")

    if raw:
        try:
            supabase_service.upsert_articles(raw)
        except Exception:
            pass  # don't block the response if DB write fails

    articles = [Article(**a) for a in raw]
    return ArticlesResponse(data=articles, total=len(articles))


@router.get("/related", response_model=ArticlesResponse)
def get_related_articles(
    q: str = Query(..., min_length=3, description="Topic/article text to search"),
    category: str = Query("general", description="Category context"),
    exclude_url: Optional[str] = Query(None, description="URL to omit from results"),
    page_size: int = Query(24, ge=1, le=50),
    max_age_hours: int = Query(120, ge=6, le=336),
):
    """Return topic-relevant multi-source articles and store them in Supabase."""
    try:
        raw = news_service.fetch_related_topic(
            query=q,
            category=category,
            page_size=page_size,
            max_age_hours=max_age_hours,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"NewsAPI error: {str(e)}")

    if exclude_url:
        raw = [a for a in raw if a.get("url") != exclude_url]

    if raw:
        try:
            supabase_service.upsert_articles(raw)
        except Exception:
            pass

    articles = [Article(**a) for a in raw]
    return ArticlesResponse(data=articles, total=len(articles))


@router.post("/analyze-url", response_model=Article, status_code=201)
def analyze_url(
    url: str = Query(..., description="Public URL of the article to analyze"),
    category: str = Query("general", description="Category tag to assign"),
):
    """
    Scrape an article by URL, score it with the bias model, store it in
    Supabase, and return the annotated Article.
    """
    try:
        scraped = scraper_service.scrape_article(url)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not scrape URL: {str(e)}")

    text_for_bias = " ".join(
        filter(None, [scraped.get("title"), scraped.get("summary"), scraped.get("content")])
    )
    bias, bias_confidence = bias_service.predict_bias(
        text=text_for_bias or None,
        domain=news_service._extract_domain(url),
    )

    article_data = {
        **scraped,
        "category": category,
        "sentiment": "neutral",
        "bias": bias,
        "bias_confidence": bias_confidence,
        "published_at": None,
    }

    try:
        supabase_service.upsert_articles([article_data])
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return Article(**article_data)


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
