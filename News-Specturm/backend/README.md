# News Spectrum — Backend

FastAPI backend for the News Spectrum application. Fetches news articles from Event Registry, stores them in Supabase, and exposes a REST API consumed by the Next.js frontend.

## Tech Stack

- **Python 3.11+**
- **FastAPI** — web framework
- **Supabase** — PostgreSQL database
- **Event Registry** — news article source
- **Uvicorn** — ASGI server
- **Pydantic v2** — data validation

## Project Structure

```
backend/
├── main.py                   # App entry point, CORS config
├── requirements.txt
├── .env.example              # Copy to .env and fill in keys
├── models/
│   └── article.py            # Pydantic models (Article, ArticleCreate, ArticlesResponse)
├── routers/
│   └── articles.py           # API route handlers
└── services/
    ├── supabase_service.py   # Supabase client and query helpers
    └── news_service.py       # Event Registry fetch helpers
```

## Setup

### 1. Prerequisites

- Python 3.11 or newer
- A [Supabase](https://supabase.com) project
- An [Event Registry](https://newsapi.ai/documentation?tab=introduction) API key

### 2. Database

Run the schema in your Supabase project's SQL editor:

```
news-specturm/supabase/schema.sql
```

This creates the `articles` table and the necessary RLS policies.

### 3. Environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your keys:

| Variable | Where to find it |
|---|---|
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |
| `EVENT_REGISTRY_API_KEY` | [newsapi.ai/documentation](https://newsapi.ai/documentation?tab=introduction) |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/app/apikey) |

`GEMINI_API_KEY` is reserved for the summarization feature and is not required to run the server now.

### 4. Install dependencies

```bash
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 5. Run the server

```bash
uvicorn main:app --reload --port 8000
```

The API is now available at `http://localhost:8000`.

## API Reference

Interactive docs are auto-generated at `http://localhost:8000/docs`.

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Returns `{ "status": "ok" }` |

### Articles

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/articles` | List articles stored in Supabase |
| `GET` | `/api/articles/fetch-news` | Fetch from Event Registry and upsert into Supabase |
| `GET` | `/api/articles/{id}` | Get a single article by UUID |
| `POST` | `/api/articles` | Manually create an article |

#### `GET /api/articles` — query params

| Param | Type | Description |
|---|---|---|
| `category` | string | Filter by category (e.g. `technology`, `sports`) |
| `sentiment` | string | Filter by `positive`, `neutral`, or `negative` |
| `search` | string | Case-insensitive title search |
| `limit` | int | Max results (default `50`, max `200`) |

#### `GET /api/articles/fetch-news` — query params

| Param | Type | Default | Description |
|---|---|---|---|
| `category` | string | `general` | Event Registry category to pull |
| `country` | string | `us` | Country code |
| `page_size` | int | `20` | Number of articles to fetch (max `100`) |

Valid categories: `business`, `entertainment`, `general`, `health`, `science`, `sports`, `technology`.

#### `POST /api/articles` — request body

```json
{
  "title": "Article title",
  "source": "Source name",
  "url": "https://example.com/article",
  "summary": "Optional summary",
  "category": "technology",
  "sentiment": "neutral",
  "published_at": "2025-01-01T00:00:00Z"
}
```

## Connecting to the Frontend

The frontend reads `NEXT_PUBLIC_API_URL` to locate this server. In development both sides run locally:

```
Backend  → http://localhost:8000
Frontend → http://localhost:3000
```

Set `ALLOWED_ORIGIN=http://localhost:3000` in `.env` so the CORS middleware accepts requests from the frontend.
