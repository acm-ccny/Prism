"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { Article } from "../../lib/types";
import BiasDistribution, {
  biasCounts,
} from "../../components/editorial/BiasDistribution";
import FullFeedRow from "../../components/editorial/FullFeedRow";
import ArticleCanvas from "../../components/ArticleCanvas.client";

type BiasFacet = "all" | "left" | "center" | "right";
type Sort = "Latest" | "By spectrum";

const SORTS: Sort[] = ["Latest", "By spectrum"];
const FACETS: BiasFacet[] = ["all", "left", "center", "right"];
const FACET_LABEL: Record<BiasFacet, string> = {
  all: "All",
  left: "Left",
  center: "Center",
  right: "Right",
};
const BIAS_ORDER: Record<string, number> = { left: 0, center: 1, right: 2 };

const dateMs = (iso: string | null): number => {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
};

interface Props {
  articles: Article[];
  query: string;
}

export default function SearchResultsClient({ articles, query }: Props) {
  const [bias, setBias] = useState<BiasFacet>("all");
  const [sort, setSort] = useState<Sort>("Latest");
  const [selected, setSelected] = useState<Article | null>(null);

  const counts = useMemo(() => biasCounts(articles), [articles]);
  const sourceCount = useMemo(
    () => new Set(articles.map((a) => a.source)).size,
    [articles],
  );

  const filtered = useMemo(() => {
    let r = articles;
    if (bias !== "all") r = r.filter((a) => a.bias === bias);
    const sorted = [...r];
    if (sort === "By spectrum") {
      sorted.sort((a, b) => {
        const aOrder = BIAS_ORDER[a.bias ?? "center"] ?? 1;
        const bOrder = BIAS_ORDER[b.bias ?? "center"] ?? 1;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return dateMs(b.published_at) - dateMs(a.published_at);
      });
    } else {
      sorted.sort((a, b) => dateMs(b.published_at) - dateMs(a.published_at));
    }
    return sorted;
  }, [articles, bias, sort]);

  const isEmpty = articles.length === 0;
  const N = articles.length;

  return (
    <main
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "32px 28px 80px",
        fontFamily: "var(--font-inter), Inter, sans-serif",
      }}
    >
      {/* Results header */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
          borderBottom: "1px solid var(--ed-divider-strong)",
          paddingBottom: 18,
          marginBottom: 22,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily:
                "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "var(--ed-text-muted)",
              marginBottom: 12,
            }}
          >
            ◆ Search · {N} result{N === 1 ? "" : "s"}
          </div>
          <h1
            className="ed-mega-h1"
            style={{
              fontSize: 48,
              lineHeight: 1,
              letterSpacing: "-0.035em",
              fontWeight: 800,
              margin: 0,
              color: "var(--ed-h1)",
              textWrap: "balance",
            }}
          >
            Results for &ldquo;{query}&rdquo;.
          </h1>
        </div>
        {!isEmpty && (
          <div
            style={{
              fontFamily:
                "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
              fontSize: 11,
              color: "var(--ed-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {sourceCount} source{sourceCount === 1 ? "" : "s"} · across the
            spectrum
          </div>
        )}
      </div>

      {isEmpty ? (
        <EmptyState query={query} />
      ) : (
        <>
          {/* Coverage skew card */}
          <div
            style={{
              background: "var(--ed-card)",
              border: "1px solid var(--ed-hairline)",
              borderRadius: 10,
              padding: "18px 22px",
              marginBottom: 22,
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 28,
              alignItems: "center",
            }}
            className="ed-coverage-skew"
          >
            <div>
              <div
                style={{
                  fontFamily:
                    "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--ed-text-muted)",
                  marginBottom: 4,
                }}
              >
                Coverage skew
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: "-0.015em",
                  color: "var(--ed-text-primary)",
                }}
              >
                How &ldquo;{query}&rdquo; was covered
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <BiasDistribution
                articles={articles}
                variant="spectrum"
                height={10}
              />
            </div>
          </div>

          {/* Facets + sort */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            {FACETS.map((f) => {
              const active = bias === f;
              const count =
                f === "all"
                  ? articles.length
                  : counts[f as "left" | "center" | "right"];
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setBias(active ? "all" : f)}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 999,
                    fontFamily:
                      "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: active
                      ? "var(--ed-text-accent)"
                      : "transparent",
                    color: active
                      ? "var(--ed-surface)"
                      : "var(--ed-text-card-meta)",
                    border: `1px solid ${
                      active ? "var(--ed-text-accent)" : "var(--ed-hairline)"
                    }`,
                    transition: "background 150ms, color 150ms",
                  }}
                >
                  {f !== "all" && (
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 4,
                        background: `var(--ed-bias-${f}-color)`,
                      }}
                    />
                  )}
                  {FACET_LABEL[f]} {count}
                </button>
              );
            })}
            <div style={{ flex: 1 }} />
            <div
              style={{
                display: "flex",
                gap: 18,
                fontFamily:
                  "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {SORTS.map((s) => {
                const active = sort === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSort(s)}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: "inherit",
                      letterSpacing: "inherit",
                      textTransform: "inherit",
                      color: active
                        ? "var(--ed-text-accent)"
                        : "var(--ed-text-muted)",
                      fontWeight: active ? 600 : 500,
                      borderBottom: active
                        ? "2px solid var(--ed-text-accent)"
                        : "2px solid transparent",
                      paddingBottom: 4,
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* The list */}
          <div style={{ borderTop: "2px solid var(--ed-text-accent)" }}>
            {filtered.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  color: "var(--ed-text-muted)",
                  fontSize: 14,
                }}
              >
                No {bias === "all" ? "" : `${FACET_LABEL[bias].toLowerCase()} `}
                results in this filter.
              </p>
            ) : (
              filtered.map((a) => (
                <FullFeedRow
                  key={a.id || a.url}
                  article={a}
                  query={query}
                  onClick={() => setSelected(a)}
                />
              ))
            )}
          </div>
        </>
      )}

      {selected && (
        <ArticleCanvas article={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 0 40px",
        maxWidth: 560,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          fontFamily:
            "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--ed-text-muted)",
          marginBottom: 14,
        }}
      >
        Nothing turned up
      </div>
      <h2
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "var(--ed-h1)",
          margin: 0,
          marginBottom: 12,
          letterSpacing: "-0.02em",
          textWrap: "balance",
        }}
      >
        We couldn&apos;t find coverage for &ldquo;{query}&rdquo;.
      </h2>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.55,
          color: "var(--ed-text-body)",
          margin: 0,
          marginBottom: 24,
        }}
      >
        Try a different keyword, or browse top stories.
      </p>
      <Link
        href="/home"
        className="ed-btn-outline"
        style={{
          display: "inline-block",
          padding: "10px 18px",
          border: "1px solid var(--ed-hairline)",
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 600,
          color: "var(--ed-text-primary)",
          textDecoration: "none",
          background: "transparent",
        }}
      >
        Back to top stories
      </Link>
    </div>
  );
}
