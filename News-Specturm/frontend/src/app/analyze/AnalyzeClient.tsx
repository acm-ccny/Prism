"use client";

import { useState } from "react";
import { analyzeUrl } from "../../lib/api";
import type { Article } from "../../lib/types";
import BiasTag from "../../components/BiasTag";

const CATEGORIES = [
  "general",
  "politics",
  "technology",
  "business",
  "science",
  "sports",
  "health",
  "entertainment",
];

export default function AnalyzeClient() {
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const article = await analyzeUrl({ url: url.trim(), category });
      setResult(article);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "48px 24px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "var(--ed-text-primary)",
            marginBottom: 8,
          }}
        >
          Analyze Article
        </h1>
        <p style={{ fontSize: 14, color: "var(--ed-text-muted)", lineHeight: 1.6 }}>
          Paste any news article URL. The bias model scores it and saves it to the database.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label
            htmlFor="article-url"
            style={{ fontSize: 12, fontWeight: 600, color: "var(--ed-text-dim)", letterSpacing: "0.06em", textTransform: "uppercase" }}
          >
            Article URL
          </label>
          <input
            id="article-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            placeholder="https://www.nytimes.com/…"
            style={{
              padding: "10px 14px",
              fontSize: 14,
              borderRadius: 8,
              border: "1px solid var(--ed-hairline)",
              background: "var(--ed-chip-bg)",
              color: "var(--ed-text-primary)",
              outline: "none",
              fontFamily: "inherit",
              width: "100%",
              boxSizing: "border-box",
            }}
          />

          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              <label
                htmlFor="category"
                style={{ fontSize: 12, fontWeight: 600, color: "var(--ed-text-dim)", letterSpacing: "0.06em", textTransform: "uppercase" }}
              >
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  padding: "10px 14px",
                  fontSize: 14,
                  borderRadius: 8,
                  border: "1px solid var(--ed-hairline)",
                  background: "var(--ed-chip-bg)",
                  color: "var(--ed-text-primary)",
                  outline: "none",
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim()}
              style={{
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 8,
                border: "none",
                background: loading || !url.trim() ? "var(--ed-hairline)" : "var(--ed-text-accent)",
                color: loading || !url.trim() ? "var(--ed-text-muted)" : "#fff",
                cursor: loading || !url.trim() ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                flexShrink: 0,
                transition: "background 0.15s",
              }}
            >
              {loading ? "Analyzing…" : "Analyze"}
            </button>
          </div>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: 24,
            padding: "14px 16px",
            borderRadius: 8,
            background: "oklch(0.97 0.015 25)",
            border: "1px solid oklch(0.88 0.04 25)",
            color: "oklch(0.45 0.15 25)",
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          style={{
            marginTop: 32,
            border: "1px solid var(--ed-hairline)",
            borderRadius: 12,
            overflow: "hidden",
            background: "var(--ed-card)",
          }}
        >
          {result.image_url && (
            <div style={{ width: "100%", height: 240, overflow: "hidden" }}>
              <img
                src={result.image_url}
                alt={result.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}

          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Bias + source row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {result.bias && <BiasTag bias={result.bias} />}
              {result.bias_confidence != null && (
                <span style={{ fontSize: 12, color: "var(--ed-text-muted)" }}>
                  {(result.bias_confidence * 100).toFixed(0)}% confidence
                </span>
              )}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--ed-text-dim)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginLeft: "auto",
                }}
              >
                {result.source}
              </span>
            </div>

            {/* Title */}
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.3,
                color: "var(--ed-text-primary)",
                textDecoration: "none",
              }}
            >
              {result.title}
            </a>

            {/* Summary */}
            {result.summary && (
              <p style={{ fontSize: 14, color: "var(--ed-text-muted)", lineHeight: 1.6, margin: 0 }}>
                {result.summary}
              </p>
            )}

            {/* Category chip */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: 4,
                  background: "var(--ed-chip-bg)",
                  border: "1px solid var(--ed-hairline)",
                  color: "var(--ed-text-dim)",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {result.category}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--ed-text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Saved to database
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
