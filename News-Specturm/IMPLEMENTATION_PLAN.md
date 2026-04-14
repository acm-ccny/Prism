# Plan: Home Page + Bias Detection

## Context

News-Spectrum is a bias-detection web app. The backend (FastAPI + Supabase + NewsAPI) is wired up and serving articles, but the two core features are missing:

1. **The home page doesn't show real articles.** `frontend/src/app/page.tsx` renders a hardcoded mock grid (`Array.from({ length: 12 }, (_, i) => ({ id: i + 1 }))` at line ~63). There is no data fetching and no call to the backend.
2. **There is no bias detection.** The `Article` model in `backend/models/article.py` has no `bias` field. `news_service.py` line ~45 writes `"sentiment": "neutral"` as a placeholder with a comment `# placeholder until the ML model is integrated`.

The team has ~1 month to ship. This plan covers both features and lays out three viable paths for the bias model with pros, cons, and a recommendation. Engineers should pick one path before starting the backend bias work.

Also note: `supabase/schema.sql` is currently empty (1 line). The schema has been applied directly in the Supabase dashboard, not checked into the repo. The plan treats `schema.sql` as something to author as part of this work so the team has a reproducible source of truth.

---

## Part A — Home page with real articles

### Files to modify / create

- **Create** `frontend/src/lib/api.ts` — thin wrapper around `fetch` that reads `NEXT_PUBLIC_API_URL` and calls `GET /api/articles` with optional query params (`category`, `search`, `limit`). Return the parsed `ArticlesResponse` shape already defined on the backend.
- **Create** `frontend/src/lib/types.ts` — TypeScript mirror of `backend/models/article.py`'s `Article` model. Keep field names identical so there's no mapping layer.
- **Create** `frontend/src/components/ArticleCard.tsx` — extract the article card markup currently inlined at `page.tsx` lines ~294–319 into a reusable component. Props: the `Article` object. Renders title, source, image, published date, category pill, and **bias pill** (see Part B).
- **Modify** `frontend/src/app/page.tsx`:
  - Convert to an async Server Component (Next 16 supports this; see `frontend/AGENTS.md` — do not assume prior Next.js knowledge, read `node_modules/next/dist/docs/` before writing).
  - Replace the mock `articles` array with `await getArticles({ category })` from `lib/api.ts`.
  - Read the selected category from a URL search param (`?category=technology`) so the sidebar buttons can be plain `<Link>` elements. This avoids introducing client-side state for something that's just navigation.
  - Keep the dark-mode toggle and search input as client components if needed — split them out into their own files (`Header.client.tsx`, `Sidebar.client.tsx`) rather than converting the whole page to a client component.
- **Modify** `frontend/.env.local` (and document in README) — `NEXT_PUBLIC_API_URL=http://localhost:8000`.

### Backend changes needed for the home page

The existing `GET /api/articles` endpoint already supports `category`, `search`, and `limit`. **No backend changes are required for the home page itself** — all changes are frontend. The only backend work is in Part B (adding the bias field) which flows through to the card naturally once the field exists on the response.

### Empty-state and error handling

- If the articles table is empty, show a "Load latest news" button that calls `GET /api/articles/fetch-news?category=general`. Useful in dev when Supabase is fresh.
- If the fetch fails, render a static error state. Don't retry silently — one failure, one message.

### Verification

1. `cd backend && uvicorn main:app --reload --port 8000`
2. Hit `http://localhost:8000/api/articles/fetch-news?category=general` once to populate Supabase.
3. `cd frontend && npm run dev`
4. Visit `http://localhost:3000`, confirm real article cards render.
5. Click a sidebar category, confirm the URL updates to `?category=X` and the grid filters.
6. Stop the backend, reload — confirm the error state shows instead of a crash.

---

## Part B — Bias detection

### Schema and data-model changes (shared by all three model options)

These changes are the same regardless of which model approach is chosen. Do them first.

- **Modify** `backend/models/article.py`:
  - Add `bias: Optional[Literal["left", "center", "right"]] = None` to both `Article` and `ArticleCreate`.
  - Consider adding `bias_confidence: Optional[float] = None` so the UI can show uncertainty later.
- **Modify** `supabase/schema.sql`:
  - This file is currently empty. Write the full `articles` table definition to it, matching the Pydantic model. Include columns: `id uuid`, `title text`, `source text`, `summary text`, `content text`, `url text unique`, `image_url text`, `category text`, `sentiment text`, `bias text check (bias in ('left','center','right'))`, `bias_confidence real`, `published_at timestamptz`, `created_at timestamptz default now()`.
  - Add index on `(bias)` and a composite index on `(category, bias)` for the filter path.
  - Apply the diff in the Supabase SQL editor (there's no migration tool in the repo).
- **Modify** `backend/services/supabase_service.py`:
  - The `upsert` call already passes the full dict — no change needed as long as the new fields are present on the dict being upserted.
- **Modify** `backend/services/news_service.py`:
  - Remove the `"sentiment": "neutral"` placeholder at line ~45.
  - Call `bias_service.classify(article_dict)` (see below) and attach `bias` + `bias_confidence` to each parsed article before returning from `_parse_article`.
- **Create** `backend/services/bias_service.py`:
  - Exposes a single function `classify(article: dict) -> tuple[str, float]` returning `(label, confidence)`.
  - The *internals* of this file are what the three options below differ on. Everything else in the backend is written once against this interface.

### Frontend surfacing

- `ArticleCard.tsx` renders a `<BiasPill bias={article.bias} />` — a small colored tag (blue/gray/red) next to the source name. Unknown bias renders nothing.
- Optional later: a top-bar filter to show only left / center / right. The `GET /api/articles` endpoint will need a `bias` query param added — one line in `routers/articles.py` and `services/supabase_service.py`.

---

## Bias model: three options

### Option 1 — Source-based lookup (AllSides-style)

**What it is:** A static JSON file (`backend/data/source_bias.json`) mapping ~50–100 common news source names/domains to `left`, `center`, or `right`. `bias_service.classify()` does a dict lookup on `article["source"]` or the domain of `article["url"]`. If unknown, returns `None`. Labels come from AllSides media bias chart (publicly documented) or Ad Fontes Media.

**Pros:**
- Ships in a day. Unblocks the entire frontend immediately.
- Zero inference latency, zero dependencies, zero compute cost.
- Matches what most real "bias detection" demos do under the hood — bias is largely source-determined in practice.
- Trivial to debug and explain to non-technical reviewers.
- The `bias_service.classify()` interface is identical to the other options, so this can be swapped out later for zero cost.

**Cons:**
- Not machine learning. Doesn't satisfy the "train a model" goal if that's being evaluated.
- Unknown sources get no label. Coverage depends on how thoroughly the JSON is filled in.
- A centrist article from a left-leaning source still gets labeled "left."

**Work:** ~1 day. One file to write, one service to wire up.

---

### Option 2 — Fine-tune a small transformer (PyTorch + Hugging Face)

**What it is:** Fine-tune **DistilBERT** (a 66M-parameter compressed BERT variant) on a pre-labeled political bias dataset in a Jupyter notebook. Save the trained weights. Load them in `bias_service.py` via the `transformers` library and run inference on article title + summary at fetch time.

**Dataset options (all free, pre-labeled, no manual labeling needed):**
- `valurank/PoliticalBias_AllSides_Txt` on Hugging Face — ~20k articles labeled left/center/right using AllSides source ratings. Best fit.
- `cajcodes/political-bias` on Hugging Face — similar, smaller.
- Webis / SemEval hyperpartisan news dataset — larger but binary (hyperpartisan vs not), not 3-way. Less useful here.

**Compute requirements:**
- Training: Google Colab free tier gives a T4 GPU for a few hours/day. Fine-tuning DistilBERT on 20k articles for 3 epochs takes ~20–40 minutes on that GPU. **No local GPU required.**
- Serving: CPU inference, ~100–300ms per article. Model file is ~250MB; ships with the backend or pulled from Hugging Face Hub on startup.
- New backend dependencies: `torch` (~800MB install), `transformers` (~500MB with model cache). Backend Docker image / venv will get noticeably larger.

**Workflow:**
1. Create `backend/notebooks/train_bias_model.ipynb` — loads dataset with `datasets.load_dataset()`, tokenizes with DistilBERT's tokenizer, fine-tunes with `transformers.Trainer`, evaluates on a 10% holdout, saves weights to `backend/models_data/bias_distilbert/`.
2. `bias_service.py` loads the saved model once at startup via `AutoModelForSequenceClassification.from_pretrained(...)` and reuses it across requests.
3. Classify using article title + summary concatenated (not full content — too long, slower, marginal gains).

**Pros:**
- Real machine learning. Matches the stated stack (PyTorch, Jupyter, pandas).
- Likely accuracy ~80–85% on 3-way classification based on public benchmarks with this dataset.
- The notebook is a tangible artifact to show — cleanly separates training from serving.
- Works on unknown sources (generalizes from text content, not source identity).

**Cons:**
- Multi-day effort (2–5 days) including debugging Colab quirks.
- Adds ~1.3GB of dependencies to the backend. Non-trivial for deployment.
- ~100–300ms per-article CPU inference, so the `fetch-news` endpoint gets slower. Mitigate by classifying once at upsert time, never at read time.
- If the training run fails or quality is bad, you lose days.

**Work:** ~3–5 days for one engineer, assuming Colab and Python ML experience. Longer if not.

---

### Option 3 — Pretrained HF model (no training)

**What it is:** Use an existing political-bias classifier someone else already trained and published on Hugging Face. `transformers.pipeline("text-classification", model="premsa/political-bias-prediction-allsides-BERT")` — three lines. Call it in `bias_service.py`.

**Pros:**
- Ships in under a day — just pip install and wire up the call.
- No training, no dataset work, no Colab. Quality is whatever the model author achieved.
- Real content-based classification — handles unknown sources.

**Cons:**
- Same dependency bloat as Option 2 (~1.3GB of `torch` + `transformers`).
- Quality depends entirely on the third-party model; you don't control it.
- Nothing for the team to show in terms of ML work — no notebook, no trained artifact. If "trained our own model" is part of the project rubric, this doesn't count.
- Model could be taken down or renamed on Hugging Face Hub.

**Work:** ~1 day.

---

## Recommendation

**Do Option 1 and Option 2 in sequence, not in parallel, not either/or.**

1. **Week 1** — Ship Part A (home page) + Option 1 (source lookup) together. This gets the entire app working end-to-end in days: real articles on the home page, real bias pills on the cards, real filters. It is not blocked on any ML work. At the end of week 1 the product is demonstrable.
2. **Weeks 2–3** — One engineer does Option 2 in parallel with the rest of the team polishing UI, adding filters, handling edge cases, writing the schema file, etc. The notebook lives in `backend/notebooks/` and the training happens on Colab. The rest of the team is never blocked on it.
3. **Week 4** — Swap `bias_service.py`'s internals from lookup to trained model. Because everything else in the codebase consumes `bias_service.classify()`, this is a **single-file change**. Demo, polish, buffer week for things breaking.

**Why this sequencing:**
- The project is never one failed training run away from having nothing to demo.
- The team still produces a real PyTorch / Jupyter / pandas artifact, which satisfies the "train a model" goal.
- Option 3 is the fallback if week 2–3 goes badly — also a single-file swap.

**Do not pick Option 3 as the primary plan** unless the team is certain they don't want to train anything themselves. It ships fast but leaves no ML artifact, and the dependency cost is the same as Option 2 so you may as well do Option 2 and get something to show for it.

**Do not pick Option 2 alone without Option 1 first.** The frontend and the rest of the backend need a working `bias_service.classify()` to build against. Starting with Option 1 gives them a real implementation to integrate with on day one, not a stub.

---

## Critical files reference

Home page:
- `frontend/src/app/page.tsx` — current mock at line ~63, card markup at ~294–319
- `frontend/src/app/layout.tsx` — root layout
- `frontend/src/supabasefile.ts` — existing hardcoded Supabase client (not used for article fetching; keep for auth only)

Backend bias:
- `backend/models/article.py` — Pydantic `Article` + `ArticleCreate`
- `backend/services/news_service.py` — `_parse_article` at ~line 45, placeholder sentiment
- `backend/services/supabase_service.py` — `upsert` on `url`, `ignore_duplicates=True`
- `backend/routers/articles.py` — `GET /api/articles` and `/fetch-news` handlers
- `backend/requirements.txt` — currently no ML deps
- `supabase/schema.sql` — currently empty, must be populated

New files:
- `backend/services/bias_service.py`
- `backend/data/source_bias.json` (Option 1)
- `backend/notebooks/train_bias_model.ipynb` (Option 2)
- `backend/models_data/bias_distilbert/` (Option 2, trained weights — consider `.gitignore` + download script)
- `frontend/src/lib/api.ts`
- `frontend/src/lib/types.ts`
- `frontend/src/components/ArticleCard.tsx`

---

## End-to-end verification

Part A:
- Fresh Supabase, run `GET /api/articles/fetch-news?category=general`, confirm Supabase has rows with a `bias` column populated (Option 1 makes this trivially testable).
- `npm run dev`, visit `/`, see real cards with bias pills.
- Click category sidebar, URL updates, grid filters.
- Stop backend, reload — graceful error state.

Part B (Option 1):
- Inspect `source_bias.json` coverage against what NewsAPI returned in step 1 — ideally >70% of fetched articles get a label.
- Unit test `bias_service.classify()` with a handful of known sources.

Part B (Option 2, when swap happens):
- Run the training notebook end-to-end on Colab, confirm eval accuracy >75% on the holdout.
- Load the model locally in `bias_service.py`, classify 10 known articles by hand, sanity-check the labels.
- Re-run `fetch-news`, confirm rows now get labels from the model even for sources not in the JSON file.
- Confirm `fetch-news` latency is still acceptable (<30s for 20 articles).
