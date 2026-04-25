"use client";
import { useEffect, useState } from "react";
import type { Article } from "../lib/types";
import BiasSpectrum from "./BiasSpectrum.client";
import type { SpectrumArticle } from "./BiasSpectrum.client";
import { buildSpectrumArticles } from "../lib/spectrum";
import { getRelatedArticles } from "../lib/api";

interface Props {
  article: Article;
  allArticles: Article[];
  onClose: () => void;
}

export default function ArticleCanvas({ article, allArticles, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const [remoteSpectrum, setRemoteSpectrum] = useState<SpectrumArticle[]>([]);

  // Animate in on mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Escape closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Strip trailing truncation marker from provider previews
  const content = article.content
    ? article.content.replace(/\s*\[\+\d+ chars\]$/, "").trim()
    : null;

  useEffect(() => {
    let active = true;

    const loadRelated = async () => {
      try {
        const response = await getRelatedArticles({
          query: article.title,
          category: article.category,
          excludeUrl: article.url,
          pageSize: 24,
          maxAgeHours: 120,
        });

        if (!active) return;
        const mapped: SpectrumArticle[] = response.data
          .filter((a) => a.bias === "left" || a.bias === "center" || a.bias === "right")
          .map((a) => ({
            title: a.title,
            source: a.source,
            url: a.url,
            bias: a.bias as "left" | "center" | "right",
            image_url: a.image_url,
            published_at: a.published_at,
          }));

        setRemoteSpectrum(mapped);
      } catch {
        if (active) setRemoteSpectrum([]);
      }
    };

    void loadRelated();
    return () => {
      active = false;
    };
  }, [article.title, article.category, article.url]);

  const localFallback = buildSpectrumArticles(article, allArticles);
  const spectrumArticlesForView: SpectrumArticle[] =
    remoteSpectrum.length > 0 ? remoteSpectrum : localFallback;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: "rgba(0,0,0,0.55)",
          opacity: visible ? 1 : 0,
        }}
        onClick={onClose}
      />

      {/* Two-panel drawer */}
      <div
        className="relative flex h-full w-full transition-transform duration-300 ease-out"
        style={{
          maxWidth: "min(960px, 100vw)",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          boxShadow: "-4px 0 40px rgba(0,0,0,0.35)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── LEFT: Article content ──────────────────── */}
        <div
          className="flex flex-col flex-1 min-w-0 h-full"
          style={{ background: "var(--d-surface)" }}
        >
          {/* Header */}
          <div
            className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b backdrop-blur-sm"
            style={{
              background: "var(--d-header)",
              borderColor: "var(--d-border)",
            }}
          >
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-sm font-medium rounded-lg px-3 py-1.5 transition-colors"
              style={{ color: "var(--d-text-muted)", background: "var(--d-hover)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Back
            </button>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-500 transition-colors"
            >
              Open article
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            {/* Hero */}
            {article.image_url ? (
              <div className="h-56 overflow-hidden">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className="h-16"
                style={{
                  background:
                    "linear-gradient(135deg, var(--d-hover) 0%, var(--d-surface) 100%)",
                }}
              />
            )}

            <div className="px-6 py-6">
              {/* Meta pills */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                  className="text-xs font-semibold rounded-full px-2.5 py-1 capitalize"
                  style={{ background: "var(--d-hover)", color: "var(--d-text-muted)" }}
                >
                  {article.category}
                </span>
                {article.bias && (
                  <span
                    className="text-xs font-semibold rounded-full px-2.5 py-1 capitalize"
                    style={{
                      background: `var(--d-bias-${article.bias}-bg)`,
                      color: `var(--d-bias-${article.bias}-color)`,
                    }}
                  >
                    {article.bias}
                  </span>
                )}
                {formattedDate && (
                  <span className="text-xs" style={{ color: "var(--d-text-muted)" }}>
                    {formattedDate}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1
                className="text-xl font-bold leading-tight mb-2"
                style={{ color: "var(--d-text)" }}
              >
                {article.title}
              </h1>

              {/* Source */}
              <p className="text-sm font-medium mb-5" style={{ color: "var(--d-text-muted)" }}>
                {article.source}
              </p>

              <div className="mb-5" style={{ height: 1, background: "var(--d-border)" }} />

              {/* Summary */}
              {article.summary && (
                <p
                  className="text-[15px] leading-relaxed mb-4"
                  style={{ color: "var(--d-text)" }}
                >
                  {article.summary}
                </p>
              )}

              {/* Body content (often provider-truncated) */}
              {content && content !== article.summary && (
                <>
                  <p
                    className="text-sm leading-relaxed mb-2"
                    style={{ color: "var(--d-text-muted)" }}
                  >
                    {content}
                  </p>
                  <p className="text-xs italic" style={{ color: "var(--d-text-sub)" }}>
                    Preview only — content may be truncated by the news provider.
                  </p>
                </>
              )}

              {!article.summary && !content && (
                <p className="text-sm italic" style={{ color: "var(--d-text-muted)" }}>
                  No preview available for this article.
                </p>
              )}

              {/* CTA */}
              <div
                className="mt-8 pt-6 border-t"
                style={{ borderColor: "var(--d-border)" }}
              >
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  Read the full article on {article.source}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Bias spectrum panel ─────────────── */}
        <div className="w-72 shrink-0 h-full">
          <BiasSpectrum
            topic={article.title}
            articles={spectrumArticlesForView}
            selectedBias={article.bias}
            selectedSource={article.source}
          />
        </div>
      </div>
    </div>
  );
}
