from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from routers import articles

load_dotenv()

ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "http://localhost:3000")


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("News Spectrum API starting up...")
    yield
    print("News Spectrum API shutting down...")


app = FastAPI(
    title="News Spectrum API",
    description="Backend API for News Spectrum — fetch, store, and serve news articles.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(articles.router, prefix="/api/articles", tags=["articles"])


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "news-spectrum-api"}
