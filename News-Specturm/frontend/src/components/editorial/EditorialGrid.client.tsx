"use client";
import { useState } from "react";
import type { Article } from "../../lib/types";
import EdCard from "./EdCard";
import SectionHeader from "./SectionHeader";
import SpectrumBand from "./SpectrumBand";
import ArticleCanvas from "../ArticleCanvas.client";

interface Props {
  articles: Article[];
  heading: string;
  searchQuery?: string;
}

export default function EditorialGrid({ articles, heading, searchQuery }: Props) {
  const [selected, setSelected] = useState<Article | null>(null);

  if (articles.length === 0) {
    return (
      <main
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "32px 28px 80px",
          fontFamily: "var(--font-inter), Inter, sans-serif",
        }}
      >
        <p
          style={{
            textAlign: "center",
            padding: "80px 0",
            color: "var(--ed-text-muted)",
            fontSize: 14,
          }}
        >
          No articles found{searchQuery ? ` for "${searchQuery}"` : ""}.
        </p>
      </main>
    );
  }

  const hero = articles[0];
  const heroSecondary = articles.slice(1, 3);
  const trio = articles.slice(3, 6);
  const longRow = articles.slice(6, 10);
  const finalGrid = articles.slice(10, 18);

  const updatedAt = articles
    .map((a) => (a.published_at ? new Date(a.published_at).getTime() : 0))
    .filter((t) => t > 0)
    .sort((a, b) => b - a)[0];

  const updatedLabel = updatedAt
    ? formatRelative(new Date(updatedAt))
    : "Just now";

  return (
    <>
      <SpectrumBand articles={articles} />

      <main
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "32px 28px 80px",
          fontFamily: "var(--font-inter), Inter, sans-serif",
        }}
      >
        {/* Mega headline */}
        <div
          style={{
            marginBottom: 22,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--ed-divider-strong)",
            paddingBottom: 16,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <h1
            className="ed-mega-h1"
            style={{
              fontSize: 56,
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              fontWeight: 800,
              margin: 0,
              color: "var(--ed-h1)",
              textWrap: "balance",
            }}
          >
            {searchQuery ? `Results for "${searchQuery}".` : `${heading}.`}
          </h1>
          <div
            style={{
              fontFamily:
                "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
              fontSize: 12,
              color: "var(--ed-text-body)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Updated {updatedLabel}
          </div>
        </div>

        {/* Featured row: 1 hero + 2 lg stacked */}
        <div
          className="ed-featured-row"
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr",
            gap: 18,
            marginBottom: 36,
          }}
        >
          <EdCard
            article={hero}
            size="xl"
            overlay
            onClick={() => setSelected(hero)}
          />
          {heroSecondary.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateRows:
                  heroSecondary.length === 2 ? "1fr 1fr" : "auto",
                gap: 18,
              }}
            >
              {heroSecondary.map((a) => (
                <EdCard
                  key={a.id || a.url}
                  article={a}
                  size="lg"
                  onClick={() => setSelected(a)}
                />
              ))}
            </div>
          )}
        </div>

        {trio.length > 0 && (
          <>
            <SectionHeader
              label="Across the desks"
              right={`${articles.length} this morning`}
            />
            <div
              className="ed-grid-3"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 18,
                marginBottom: 36,
              }}
            >
              {trio.map((a) => (
                <EdCard
                  key={a.id || a.url}
                  article={a}
                  size="md"
                  onClick={() => setSelected(a)}
                />
              ))}
            </div>
          </>
        )}

        {longRow.length > 0 && (
          <>
            <SectionHeader label="More to read" right="Latest →" />
            <div
              className="ed-grid-4"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 18,
                marginBottom: 36,
              }}
            >
              {longRow.map((a) => (
                <EdCard
                  key={a.id || a.url}
                  article={a}
                  size="sm"
                  onClick={() => setSelected(a)}
                />
              ))}
            </div>
          </>
        )}

        {finalGrid.length > 0 && (
          <>
            <SectionHeader label="The week so far" />
            <div
              className="ed-grid-4"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 18,
              }}
            >
              {finalGrid.map((a) => (
                <EdCard
                  key={a.id || a.url}
                  article={a}
                  size="sm"
                  onClick={() => setSelected(a)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {selected && (
        <ArticleCanvas
          article={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH} hr ago`;
  const diffD = Math.round(diffH / 24);
  return `${diffD} day${diffD === 1 ? "" : "s"} ago`;
}
