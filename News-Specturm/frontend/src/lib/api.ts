import type { ArticlesResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface GetArticlesParams {
  category?: string;
  search?: string;
  limit?: number;
}

export async function getArticles(
  params: GetArticlesParams = {}
): Promise<ArticlesResponse> {
  const url = new URL(`${API_URL}/api/articles`);
  if (params.category) url.searchParams.set("category", params.category);
  if (params.search) url.searchParams.set("search", params.search);
  if (params.limit != null) url.searchParams.set("limit", String(params.limit));

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`API responded with ${res.status}`);
  return res.json() as Promise<ArticlesResponse>;
}

export async function getLiveArticles(params: {
  category?: string;
  pageSize?: number;
} = {}): Promise<ArticlesResponse> {
  const url = new URL(`${API_URL}/api/articles/live`);
  if (params.category) url.searchParams.set("category", params.category);
  if (params.pageSize) url.searchParams.set("page_size", String(params.pageSize));

  const res = await fetch(url.toString(), { next: { revalidate: 120 } });
  if (!res.ok) throw new Error(`API responded with ${res.status}`);
  return res.json() as Promise<ArticlesResponse>;
}
