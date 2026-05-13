"use client";
import type { Article } from "../../lib/types";
import { formatRelativeShort } from "../../lib/time";
import ArticleImage from "./ArticleImage";
import BiasPill from "./BiasPill";
import SourceMark from "./SourceMark";

type Bias = "left" | "center" | "right";

interface Props {
  article: Article;
  query?: string;
  onClick?: () => void;
}

const formatDate = (iso: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function HighlightedText({ text, query }: { text: string; query?: string }) {
  const trimmed = query?.trim();
  if (!trimmed) return <>{text}</>;
  const splitter = new RegExp(`(${escapeRegex(trimmed)})`, "ig");
  const matcher = new RegExp(`^${escapeRegex(trimmed)}$`, "i");
  const parts = text.split(splitter);
  return (
    <>
      {parts.map((part, i) =>
        matcher.test(part) ? (
          <mark
            key={i}
            style={{
              background: "var(--ed-search-highlight)",
              color: "var(--ed-text-primary)",
              padding: "0 2px",
              borderRadius: 2,
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export default function FullFeedRow({ article, query, onClick }: Props) {
  const bias: Bias = (article.bias as Bias | null) ?? "center";
  const biasColor = `var(--ed-bias-${bias}-color)`;
  const dateLabel = formatDate(article.published_at);
  const relLabel = formatRelativeShort(article.published_at);

  return (
    <article
      onClick={onClick}
      className="ed-full-feed-row"
      style={{
        display: "grid",
        gridTemplateColumns: "8px 168px 1fr auto",
        gap: 22,
        padding: "18px 0",
        borderBottom: "1px solid var(--ed-row-hairline)",
        cursor: "pointer",
        alignItems: "stretch",
        transition: "background 200ms",
        fontFamily: "var(--font-inter), Inter, sans-serif",
      }}
    >
      <div style={{ background: biasColor, borderRadius: 4 }} />
      <div className="ed-full-feed-thumb">
        <ArticleImage
          src={article.image_url}
          alt={article.title}
          ratio="4/3"
          style={{ borderRadius: 6 }}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          minWidth: 0,
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <BiasPill bias={article.bias as Bias | null} />
          <SourceMark source={article.source} size={18} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--ed-text-card-meta)",
            }}
          >
            {article.source}
          </span>
          {article.category && (
            <>
              <span style={{ fontSize: 12, color: "var(--ed-text-dim)" }}>·</span>
              <span
                style={{
                  fontSize: 11.5,
                  color: "var(--ed-text-muted)",
                  fontFamily:
                    "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {article.category}
              </span>
            </>
          )}
          {dateLabel && (
            <>
              <span style={{ fontSize: 12, color: "var(--ed-text-dim)" }}>·</span>
              <span style={{ fontSize: 12, color: "var(--ed-text-muted)" }}>
                {dateLabel}
              </span>
            </>
          )}
        </div>
        <h3
          className="ed-full-feed-headline"
          style={{
            fontSize: 19,
            lineHeight: 1.25,
            fontWeight: 700,
            letterSpacing: "-0.018em",
            color: "var(--ed-text-primary)",
            margin: 0,
            textWrap: "pretty",
            transition: "color 200ms",
          }}
        >
          <HighlightedText text={article.title} query={query} />
        </h3>
        {article.summary && (
          <p
            style={{
              fontSize: 13.5,
              lineHeight: 1.55,
              color: "var(--ed-text-body)",
              margin: 0,
              textWrap: "pretty",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {article.summary}
          </p>
        )}
      </div>
      <div
        className="ed-full-feed-meta"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "space-between",
          fontFamily:
            "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
          fontSize: 11,
          color: "var(--ed-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          minWidth: 80,
        }}
      >
        <span style={{ fontWeight: 500 }}>{relLabel}</span>
        <span style={{ color: biasColor, fontWeight: 600 }}>read →</span>
      </div>
    </article>
  );
}
