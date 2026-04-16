import type { Article } from "../lib/types";
import { getLiveArticles } from "../lib/api";
import ArticleGrid from "../components/ArticleGrid.client";
import HeaderClient from "../components/Header.client";
import SidebarClient from "../components/Sidebar.client";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: rawCategory } = await searchParams;
  const activeCategory = rawCategory || "Home";

  // Map sidebar label → NewsAPI category slug
  const apiCategory =
    activeCategory === "Home" ? "general" : activeCategory.toLowerCase();

  let articles: Article[] = [];
  let error: string | null = null;

  try {
    const response = await getLiveArticles({ category: apiCategory, pageSize: 21 });
    articles = response.data;
  } catch {
    error = "Could not reach the news backend. Make sure it is running on port 8000.";
  }

  return (
    <div
      className="flex h-screen"
      style={{ background: "var(--d-bg)", color: "var(--d-text)" }}
    >
      <SidebarClient activeCategory={activeCategory} />

      <main
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
        style={{ background: "var(--d-bg)" }}
      >
        <HeaderClient />

        <section className="flex-1 overflow-y-auto p-6">
          {/* Section heading */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1
                className="text-lg font-semibold tracking-tight"
                style={{ color: "var(--d-text)" }}
              >
                {activeCategory === "Home" ? "Latest Stories" : activeCategory}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: "var(--d-text-muted)" }}>
                Stay informed. Detect bias.
              </p>
            </div>
            <span
              className="text-[10px] font-medium uppercase tracking-wider"
              style={{ color: "var(--d-text-muted)" }}
            >
              {articles.length} articles
            </span>
          </div>

          {/* Error state */}
          {error && (
            <div
              className="rounded-xl border p-8 text-center"
              style={{
                background: "var(--d-surface)",
                borderColor: "var(--d-border)",
              }}
            >
              <svg
                className="mx-auto mb-3"
                style={{ color: "var(--d-text-muted)" }}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm" style={{ color: "var(--d-text-muted)" }}>
                {error}
              </p>
            </div>
          )}

          {/* Article grid + canvas */}
          {!error && <ArticleGrid articles={articles} />}
        </section>
      </main>
    </div>
  );
}
