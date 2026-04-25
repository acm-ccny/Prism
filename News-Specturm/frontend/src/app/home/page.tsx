import type { Article } from "../../lib/types";
import { getLiveArticles } from "../../lib/api";
import ArticleGrid from "../../components/ArticleGrid.client";
import HeaderClient from "../../components/Header.client";
import SidebarClient from "../../components/Sidebar.client";
import RequireAuth from "../../components/RequireAuth.client";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: rawCategory } = await searchParams;
  const requestedCategory = (rawCategory || "home").toLowerCase();

  const categoryConfig: Record<string, { heading: string; apiCategory: string }> = {
    home: { heading: "Trending Now", apiCategory: "general" },
    politics: { heading: "Politics", apiCategory: "politics" },
    general: { heading: "General", apiCategory: "general" }, // legacy support
    technology: { heading: "Technology", apiCategory: "technology" },
    sports: { heading: "Sports", apiCategory: "sports" },
    science: { heading: "Science", apiCategory: "science" },
    business: { heading: "Business", apiCategory: "business" },
  };

  const selected = categoryConfig[requestedCategory] || categoryConfig.home;

  let articles: Article[] = [];
  let error: string | null = null;

  try {
    const response = await getLiveArticles({
      category: selected.apiCategory,
      pageSize: 21,
    });
    articles = response.data;
  } catch {
    error = "Could not reach the news backend. Make sure it is running on port 8000.";
  }

  return (
    <RequireAuth>
      <div
        className="flex h-screen"
        style={{ background: "var(--d-bg)", color: "var(--d-text)" }}
      >
        <SidebarClient activeCategory={requestedCategory} />

        <main
          className="flex-1 flex flex-col min-w-0 overflow-hidden"
          style={{ background: "var(--d-bg)" }}
        >
          <HeaderClient />

          <section className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1
                  className="text-lg font-semibold tracking-tight"
                  style={{ color: "var(--d-text)" }}
                >
                  {selected.heading}
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

            {error && (
              <div
                className="rounded-xl border p-8 text-center"
                style={{
                  background: "var(--d-surface)",
                  borderColor: "var(--d-border)",
                }}
              >
                <p className="text-sm" style={{ color: "var(--d-text-muted)" }}>
                  {error}
                </p>
              </div>
            )}

            {!error && <ArticleGrid articles={articles} />}
          </section>
        </main>
      </div>
    </RequireAuth>
  );
}
