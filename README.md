# Prism

A bias-detection web app for news articles. Paste a topic or URL and Prism surfaces related coverage grouped as **left-leaning**, **center**, and **right-leaning** so readers can see the full spectrum of how a story is being told.


## Why

Biased news and media outlets shape the conversation around a topic, often without readers realizing it. Prism is aimed at political commentators, independent journalists, and everyday readers who want a quick read on where a piece sits on the political spectrum — and what coverage looks like on the other side.

## Features

- **AI-powered bias classification** of news articles into left / center / right.
- **Topic-based discovery** — pull related coverage across the spectrum for a given subject.
- **Category filtering** — browse by general, technology, business, etc.
- **Search** across stored articles.

Planned:

- In-app reading so users don't need to leave Prism to read an article.
- Recommender for the home page based on what the user reads.
- AI summarization (Gemini / Claude) of long articles.

## Tech stack

| Layer | Stack |
| --- | --- |
| Frontend | Next.js 16, React 19, Tailwind CSS v4 |
| Backend | Python 3.11+, FastAPI |
| Database | Supabase (Postgres + RLS) |
| News source | NewsAPI |
| ML | PyTorch, Hugging Face Transformers, Jupyter, pandas, scikit-learn |
| Optional AI | Gemini or Claude for summarization |

## Repo layout

All project code lives under [Prism/](Prism/). Three independent sub-projects that talk to each other over HTTP and a shared Postgres:

- [Prism/backend/](Prism/backend/) — FastAPI service. Entry point `main.py`. Routes in `routers/`, Pydantic models in `models/`, integrations in `services/` (`supabase_service.py`, `news_service.py`).
- [Prism/frontend/](Prism/frontend/) — Next.js + React + Tailwind app. See [Prism/frontend/AGENTS.md](Prism/frontend/AGENTS.md) before writing Next code — this is Next.js 16, not the version most tutorials cover.
- [Prism/supabase/](Prism/supabase/) — `schema.sql` is the canonical schema for the `articles` table and RLS policies. Apply via the Supabase SQL editor; there is no migration tool.

Implementation roadmap and design decisions live in [Prism/IMPLEMENTATION_PLAN.md](Prism/IMPLEMENTATION_PLAN.md).

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 20+
- A Supabase project (free tier is fine)
- A NewsAPI key ([newsapi.org](https://newsapi.org))

### 1. Clone

```bash
git clone <repo-url>
cd team-3/Prism
```

### 2. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate           # Windows
# source .venv/bin/activate      # macOS / Linux
pip install -r requirements.txt
```

Create `backend/.env`:

```env
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEWS_API_KEY=...
ALLOWED_ORIGIN=http://localhost:3000
# GEMINI_API_KEY=...             # optional, reserved for summarization
```

Apply the schema once: open [Prism/supabase/schema.sql](Prism/supabase/schema.sql) in the Supabase SQL editor and run it.

Start the API:

```bash
uvicorn main:app --reload --port 8000
```

API runs at `http://localhost:8000`, interactive docs at `/docs`.

### 3. Frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

App runs at `http://localhost:3000`.

### 4. Populate articles

With both servers running, hit the fetch endpoint once to seed Supabase:

```
GET http://localhost:8000/api/articles/fetch-news?category=general
```

Reload the home page — real article cards should appear.

## How it works

```
NewsAPI ──► backend/services/news_service ──► bias_service.classify()
                                                       │
                                                       ▼
                                          backend/services/supabase_service
                                                       │
                                                       ▼
                                                   Supabase
                                                       │
                                                       ▼
                            frontend ◄── GET /api/articles
```

- `GET /api/articles/fetch-news` pulls from NewsAPI, classifies each article's bias, and upserts into Supabase.
- `GET /api/articles` serves stored articles with `category`, `sentiment`, `search`, and `limit` query params.
- NewsAPI is never called from the frontend.
- Two Supabase keys: anon key for reads, service-role key for writes that bypass RLS (kept inside `supabase_service.py`).

## Common commands

Backend (from `Prism/backend/`):

```bash
uvicorn main:app --reload --port 8000
```

Frontend (from `Prism/frontend/`):

```bash
npm run dev      # dev server on :3000
npm run build    # production build
npm run lint     # eslint (flat config)
```

There is no test suite yet.

## Environment variables

**Backend** (`Prism/backend/.env`):

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Read-path key (RLS-respecting) |
| `SUPABASE_SERVICE_ROLE_KEY` | Write-path key (RLS-bypassing, server-only) |
| `NEWS_API_KEY` | NewsAPI access |
| `ALLOWED_ORIGIN` | CORS origin — must match frontend URL |
| `GEMINI_API_KEY` | Optional, reserved for summarization |

**Frontend** (`Prism/frontend/.env.local`):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend base URL |

Both files must be set before either side is useful.

## Project status

In active development. See [Prism/IMPLEMENTATION_PLAN.md](Prism/IMPLEMENTATION_PLAN.md) for the current roadmap — including the three bias-model options the team is choosing between (static source lookup, fine-tuned DistilBERT, or pretrained Hugging Face classifier) and the recommended phased rollout.


