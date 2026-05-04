"use client";
import { useMemo } from "react";
import type { Article } from "../../lib/types";
import FullFeedRow from "./FullFeedRow";

interface Props {
  articles: Article[];
  onArticleClick?: (article: Article) => void;
}

const dateMs = (iso: string | null): number => {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
};

export default function FullFeed({ articles, onArticleClick }: Props) {
  const sorted = useMemo(
    () =>
      [...articles].sort(
        (a, b) => dateMs(b.published_at) - dateMs(a.published_at),
      ),
    [articles],
  );

  return (
    <section style={{ marginTop: 12 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 6,
          paddingBottom: 12,
          borderBottom: "2px solid var(--ed-text-accent)",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            margin: 0,
            color: "var(--ed-h1)",
            fontFamily: "var(--font-inter), Inter, sans-serif",
          }}
        >
          The full feed
        </h2>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "6px 14px",
            borderRadius: 999,
            background: "var(--ed-text-accent)",
            color: "var(--ed-surface)",
            fontFamily:
              "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Latest
        </span>
      </div>
      <div>
        {sorted.map((a) => (
          <FullFeedRow
            key={a.id || a.url}
            article={a}
            onClick={onArticleClick ? () => onArticleClick(a) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
