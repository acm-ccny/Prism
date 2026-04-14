# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a bias detection web app for news articles. Problem to be solved: Biased news and media outlets manipulate the conversation around a topic, hindering awareness.

Target audience: Political commentators, everyday people, independent & non-affiliated journalists. Media sources are committed to producing unbiased content.

Core Features: AI-Powered bias detection & categorization for news around a topic. Enter a URL for an article or video on a topic, and the application finds additional relevant articles and presents them as left-leaning, middle, and right-leaning sources.

Stretch Features: Browsing existing news from within the application rather than leaving it to find an article. A recommender engine so that the news we suggest on the home page is similar to what the user wants.

Tech stack: 
Frontend: Next.js (React), Tailwind CSS, 
Backend: Python (FastAPI)
Supabase for the database 
Model training: PyTorch, Jupyternotebooks, Pandas, Matplotlib, … Sck0learn…
- (For summarization, if we have time) AI Integration: Gemini or Claude 

## Repo layout

Three top-level directories — they are independent projects that talk to each other over HTTP and a shared Postgres:

- `backend/` — FastAPI service (Python 3.11+). Entry point `main.py`. Routes in `routers/`, Pydantic schemas in `models/`, integrations in `services/` (`supabase_service.py`, `news_service.py`).
- `frontend/` — Next.js 16 + React 19 + Tailwind v4 app. See `frontend/AGENTS.md` — **this is not the Next.js in your training data**; read `node_modules/next/dist/docs/` before writing Next code and heed deprecation notices.
- `supabase/schema.sql` — canonical schema for the `articles` table and RLS policies. Apply via the Supabase SQL editor; there is no migration tool.

## Commands

Backend (from `backend/`):
```bash
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000               # http://localhost:8000, docs at /docs
```

Frontend (from `frontend/`):
```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint     # eslint (flat config in eslint.config.mjs)
```

There is no test suite in either project.

## Architecture notes

- **Data flow**: `GET /api/articles/fetch-news` pulls from NewsAPI via `news_service`, upserts into Supabase via `supabase_service`. The frontend reads stored articles through `GET /api/articles` (supports `category`, `sentiment`, `search`, `limit` query params). NewsAPI is never called from the frontend.
- **Two Supabase keys**: `SUPABASE_ANON_KEY` for read paths, `SUPABASE_SERVICE_ROLE_KEY` for writes/upserts that bypass RLS. Keep service-role usage confined to `services/supabase_service.py`.
- **CORS** is configured in `backend/main.py` from `ALLOWED_ORIGIN` — must include the frontend origin (`http://localhost:3000` in dev) or browser requests will fail.
- **Frontend → backend** wiring goes through `NEXT_PUBLIC_API_URL`. Both env files must be set before either side is useful.
- `GEMINI_API_KEY` is reserved for a not-yet-implemented summarization feature; the server runs without it.

## Required env vars

Backend `.env`: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEWS_API_KEY`, `ALLOWED_ORIGIN`, (optional) `GEMINI_API_KEY`.
Frontend `.env.local`: `NEXT_PUBLIC_API_URL`.
