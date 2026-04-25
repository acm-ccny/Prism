import type { Article } from "./types";
import type { SpectrumArticle } from "../components/BiasSpectrum.client";

const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "for",
  "of",
  "on",
  "in",
  "at",
  "with",
  "from",
  "by",
  "after",
  "before",
  "is",
  "are",
  "was",
  "were",
  "this",
  "that",
  "these",
  "those",
  "as",
  "it",
  "its",
  "be",
  "has",
  "have",
  "had",
  "will",
  "new",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function titleOverlapScore(baseTitle: string, candidateTitle: string): number {
  const base = new Set(tokenize(baseTitle));
  const candidate = new Set(tokenize(candidateTitle));
  if (base.size === 0 || candidate.size === 0) return 0;

  let overlap = 0;
  for (const token of candidate) {
    if (base.has(token)) overlap += 1;
  }
  return overlap;
}

export function buildSpectrumArticles(
  selectedArticle: Article,
  allArticles: Article[],
  maxPerBias = 3
): SpectrumArticle[] {
  const selectedTokens = tokenize(selectedArticle.title).length;
  const minScore = selectedTokens >= 6 ? 2 : 1;

  const candidates = allArticles
    .filter(
      (article) =>
        article.url !== selectedArticle.url &&
        (article.bias === "left" || article.bias === "center" || article.bias === "right")
    )
    .map((article) => ({
      article,
      score: titleOverlapScore(selectedArticle.title, article.title),
    }))
    .filter((item) => item.score >= minScore)
    .sort((a, b) => b.score - a.score);

  const counts = { left: 0, center: 0, right: 0 };
  const result: SpectrumArticle[] = [];

  for (const { article } of candidates) {
    if (!article.bias) continue;
    if (counts[article.bias] >= maxPerBias) continue;

    result.push({
      title: article.title,
      source: article.source,
      url: article.url,
      bias: article.bias,
      image_url: article.image_url,
      published_at: article.published_at,
    });
    counts[article.bias] += 1;
  }

  return result;
}
