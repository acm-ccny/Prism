"use client";
import { useState } from "react";
import ArticleCard from "./ArticleCard";
import ArticleCanvas from "./ArticleCanvas.client";
import type { Article } from "../lib/types";
import BiasTag from "./BiasTag";

interface Props {
  articles: Article[];
}


export default function ArticleGrid({ articles }: Props) {
  const [selected, setSelected] = useState<Article | null>(null);

  if (articles.length === 0) {
    return (
      <p className="text-sm py-16 text-center" style={{ color: "var(--d-text-muted)" }}>
        No articles found for this category.
      </p>
    );
  }

  const featured = articles[0];
  const grid = articles.slice(1);

  const featuredDate = featured.published_at
    ? new Date(featured.published_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      {/* ── Featured story ────────────────────────────── */}
      <div
        className="mb-8 cursor-pointer group"
        onClick={() => setSelected(featured)}
      >
        {/* Hero image */}
        <div
          className="w-full overflow-hidden rounded-xl mb-4 relative"
          style={{ aspectRatio: "21 / 9" }}
        >
          {featured.image_url ? (
            <>
              <img
                src={featured.image_url}
                alt={featured.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {featured.source}
                </p>
                <h2
                  className="text-2xl font-bold text-white leading-tight line-clamp-2"
                  style={{ textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
                >
                  {featured.title}
                </h2>
              </div>
            </>
          ) : (
            <div
              className="w-full h-full flex items-end p-6"
              style={{ background: "var(--d-hover)" }}
            >
              <h2
                className="text-2xl font-bold leading-tight line-clamp-2"
                style={{ color: "var(--d-text)" }}
              >
                {featured.title}
              </h2>
            </div>
          )}
        </div>

        {/* Caption row */}
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: "var(--d-text-muted)" }}>
            {featured.source}
            {featuredDate && (
              <>
                <span style={{ color: "var(--d-border)" }}> · </span>
                {featuredDate}
              </>
            )}
            <>
              <span style={{ color: "var(--d-border)" }}> | </span>
              <BiasTag bias={featured.bias} />
            </>
          </p>
          <span
            className="text-xs transition-colors group-hover:text-blue-500"
            style={{ color: "var(--d-text-muted)" }}
          >
            Read story →
          </span>
        </div>
      </div>

      {/* Thin rule */}
      <div
        className="mb-8"
        style={{ height: 1, background: "var(--d-border)" }}
      />

      {/* ── Article grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
        {grid.map((article, i) => (
          <ArticleCard
            key={article.url ?? i}
            article={article}
            index={i}
            onClick={() => setSelected(article)}
          />
        ))}
      </div>

      {/* ── Canvas drawer ─────────────────────────────── */}
      {selected && (
        <ArticleCanvas
          article={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
