import type { Article } from "../../lib/types";
import { getArticles } from "../../lib/api";
import RequireAuth from "../../components/RequireAuth.client";
import EditorialNav from "../../components/editorial/EditorialNav.client";
import SearchResultsClient from "./SearchResultsClient";

const SEARCH_LIMIT = 60;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; search?: string }>;
}) {
  const { q, search } = await searchParams;
  const query = (q || search || "").trim();

  let articles: Article[] = [];
  let error: string | null = null;

  if (query) {
    try {
      const response = await getArticles({
        search: query,
        limit: SEARCH_LIMIT,
      });
      articles = response.data;
    } catch {
      error =
        "Could not reach the news backend. Make sure it is running on port 8000.";
    }
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
        <EditorialNav activeCategory="" initialSearch={query} />

        {error ? (
          <div
            style={{
              maxWidth: 1200,
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
          <SearchResultsClient articles={articles} query={query} />
        )}
      </div>
    </RequireAuth>
  );
}
