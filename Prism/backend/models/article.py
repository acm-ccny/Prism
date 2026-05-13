from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime


class Article(BaseModel):
    id: Optional[str] = None
    title: str
    source: str
    summary: Optional[str] = None
    content: Optional[str] = None
    url: str
    image_url: Optional[str] = None
    category: str = "general"
    sentiment: Optional[str] = "neutral"  # positive | neutral | negative
    bias: Optional[str] = None  # left | center | right
    bias_confidence: Optional[float] = None
    published_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ArticleCreate(BaseModel):
    title: str
    source: str
    summary: Optional[str] = None
    content: Optional[str] = None
    url: str
    image_url: Optional[str] = None
    category: str = "general"
    sentiment: Optional[str] = "neutral"
    published_at: Optional[datetime] = None


class ArticlesResponse(BaseModel):
    data: list[Article]
    total: int
