"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Article {
  id?: string;
  title: string;
  source: string;
  summary?: string;
  url: string;
  image_url?: string;
  category: string;
  sentiment?: string;
  published_at?: string;
}

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "bg-green-100 text-green-800",
  negative: "bg-red-100 text-red-800",
  neutral: "bg-gray-100 text-gray-700",
};

const CATEGORIES = [
  "all",
  "general",
  "technology",
  "business",
  "science",
  "health",
  "sports",
  "entertainment",
];

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  async function loadArticles(cat: string, q: string) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (cat && cat !== "all") params.set("category", cat);
      if (q) params.set("search", q);
      const res = await fetch(`${API_URL}/api/articles?${params}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      setArticles(json.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load articles");
    } finally {
      setLoading(false);
    }
  }

  async function fetchLatestNews() {
    setFetching(true);
    setError(null);
    try {
      const cat = category !== "all" ? category : "general";
      const res = await fetch(
        `${API_URL}/api/articles/fetch-news?category=${cat}&page_size=20`
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      await loadArticles(category, search);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch news");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    loadArticles(category, search);
  }, [category]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadArticles(category, search);
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            News Spectrum
          </h1>
          <button
            onClick={fetchLatestNews}
            disabled={fetching}
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {fetching ? "Fetching…" : "Fetch Latest News"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-3 py-1 text-sm font-medium capitalize transition ${
                  category === cat
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 sm:ml-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles…"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
            >
              Search
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20 text-zinc-400">
            Loading articles…
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && articles.length === 0 && (
          <div className="flex flex-col items-center py-20 text-zinc-400">
            <p className="mb-4">No articles yet.</p>
            <button
              onClick={fetchLatestNews}
              className="rounded-full bg-zinc-900 px-5 py-2 text-sm text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
            >
              Fetch Latest News
            </button>
          </div>
        )}

        {/* Article grid */}
        {!loading && articles.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, idx) => (
              <a
                key={article.id ?? idx}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
              >
                {article.image_url && (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="h-44 w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs capitalize text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                      {article.category}
                    </span>
                    {article.sentiment && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                          SENTIMENT_COLORS[article.sentiment] ??
                          SENTIMENT_COLORS.neutral
                        }`}
                      >
                        {article.sentiment}
                      </span>
                    )}
                  </div>
                  <h2 className="text-sm font-semibold leading-snug text-zinc-900 group-hover:underline dark:text-white">
                    {article.title}
                  </h2>
                  {article.summary && (
                    <p className="line-clamp-3 text-xs text-zinc-500 dark:text-zinc-400">
                      {article.summary}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-2 text-xs text-zinc-400">
                    <span>{article.source}</span>
                    {article.published_at && (
                      <span>
                        {new Date(article.published_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
