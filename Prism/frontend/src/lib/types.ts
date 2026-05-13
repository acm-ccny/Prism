export interface Article {
  id: string;
  title: string;
  source: string;
  summary: string | null;
  content: string | null;
  url: string;
  image_url: string | null;
  category: string;
  sentiment: string | null;
  published_at: string | null;
  created_at: string | null;
  bias: "left" | "center" | "right" | null;
  bias_confidence: number | null;
}

export interface ArticlesResponse {
  data: Article[];
  total: number;
}
