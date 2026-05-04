import type { Article } from "../../lib/types";
import { getArticles } from "../../lib/api";
import RequireAuth from "../../components/RequireAuth.client";
import EditorialNav from "../../components/editorial/EditorialNav.client";
import EditorialGrid from "../../components/editorial/EditorialGrid.client";

const FIRST_PAGE_SIZE = 21;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category: rawCategory, search } = await searchParams;
  const requestedCategory = (rawCategory || "home").toLowerCase();

  const categoryConfig: Record<string, { heading: string; apiCategory: string }> = {
    home: { heading: "Top stories", apiCategory: "general" },
    politics: { heading: "Politics", apiCategory: "politics" },
    general: { heading: "General", apiCategory: "general" },
    technology: { heading: "Technology", apiCategory: "technology" },
    sports: { heading: "Sports", apiCategory: "sports" },
    science: { heading: "Science", apiCategory: "science" },
    business: { heading: "Business", apiCategory: "business" },
  };

  const selected = categoryConfig[requestedCategory] || categoryConfig.home;

  let articles: Article[] = [];
  let error: string | null = null;

  try {
    const response = await getArticles({
      // For "home", omit category so we pull across all stored articles.
      category:
        requestedCategory === "home" ? undefined : selected.apiCategory,
      search: search || undefined,
      limit: FIRST_PAGE_SIZE,
    });
    articles = response.data;
  } catch {
    error = "Could not reach the news backend. Make sure it is running on port 8000.";
  }

  return (
    <RequireAuth>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--ed-page-bg)",
          color: "var(--ed-text-primary)",
          fontFamily: "var(--font-inter), Inter, sans-serif",
        }}
      >
        <EditorialNav
          activeCategory={requestedCategory}
          initialSearch={search ?? ""}
        />

        {error ? (
          <div
            style={{
              maxWidth: 1440,
              margin: "0 auto",
              padding: "60px 28px",
            }}
          >
            <div
              style={{
                background: "var(--ed-card)",
                border: "1px solid var(--ed-card-border)",
                borderRadius: 12,
                padding: 40,
                textAlign: "center",
                color: "var(--ed-text-muted)",
                fontSize: 14,
              }}
            >
              {error}
            </div>
          </div>
        ) : (
          <EditorialGrid
            articles={articles}
            heading={selected.heading}
            searchQuery={search}
          />
        )}
      </div>
    </RequireAuth>
  );
}
