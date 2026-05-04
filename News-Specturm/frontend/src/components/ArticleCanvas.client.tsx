"use client";
import { useEffect, useState } from "react";
import type { Article } from "../lib/types";
import { formatRelativeShort } from "../lib/time";
import BiasSpectrum from "./BiasSpectrum.client";
import SourceMark from "./editorial/SourceMark";

interface Props {
  article: Article;
  onClose: () => void;
}

type Bias = "left" | "center" | "right";

const monoStyle = {
  fontFamily: "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
  textTransform: "uppercase" as const,
};

const BIAS_LABEL: Record<Bias, string> = {
  left: "Left",
  center: "Center",
  right: "Right",
};

const formatLongDate = (iso: string | null): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (iso: string | null): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

export default function ArticleCanvas({ article, onClose }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const dateLabel = formatLongDate(article.published_at);
  const timeLabel = formatTime(article.published_at);
  const relLabel = formatRelativeShort(article.published_at);

  const rawContent = article.content
    ? article.content.replace(/\s*\[\+\d+ chars\]$/, "").trim()
    : null;
  const isTruncated = !!article.content && /\[\+\d+ chars\]$/.test(article.content);
  const bodyText =
    rawContent && rawContent !== article.summary ? rawContent : null;

  const bias: Bias = (article.bias as Bias | null) ?? "center";
  const cfgColor = `var(--ed-bias-${bias}-color)`;
  const cfgInk = `var(--ed-bias-${bias}-ink)`;

  const bodyParas = bodyText
    ? bodyText
        .split(/\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "flex-end",
        fontFamily: "var(--font-inter), Inter, sans-serif",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "oklch(0.14 0 0 / 0.45)",
          backdropFilter: "blur(2px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 280ms ease",
        }}
      />

      {/* Two-panel shell */}
      <div
        className="ed-drawer-shell"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          height: "100%",
          width: "min(1080px, 100vw)",
          background: "var(--ed-page-bg)",
          boxShadow:
            "-8px 0 60px oklch(0 0 0 / 0.18), -1px 0 0 0 var(--ed-hairline)",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 360ms cubic-bezier(0.22, 1, 0.36, 1)",
          display: "flex",
        }}
      >
        {/* ── LEFT: Article column ─────────────────────── */}
        <div
          className="ed-drawer-article"
          style={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "var(--ed-page-bg)",
          }}
        >
          {/* Sticky header */}
          <header
            style={{
              flexShrink: 0,
              background: "var(--ed-surface)",
              borderBottom: "1px solid var(--ed-hairline)",
              padding: "12px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <button
              onClick={onClose}
              className="ed-btn-outline"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 12px 7px 10px",
                background: "transparent",
                border: "1px solid var(--ed-hairline)",
                borderRadius: 6,
                cursor: "pointer",
                ...monoStyle,
                fontSize: 11,
                fontWeight: 600,
                color: "var(--ed-text-accent)",
                letterSpacing: "0.08em",
                transition: "background 200ms",
              }}
            >
              <svg
                width="11"
                height="11"
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

            <div
              className="ed-breadcrumb"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                ...monoStyle,
                fontSize: 10.5,
                fontWeight: 600,
                color: "var(--ed-text-muted)",
                letterSpacing: "0.14em",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              <span>The Spectrum</span>
              <span style={{ color: "var(--ed-divider-strong)" }}>/</span>
              <span style={{ color: cfgInk }}>
                {article.category || "General"}
              </span>
              <span style={{ color: "var(--ed-divider-strong)" }}>/</span>
              <span style={{ color: "var(--ed-text-primary)" }}>Article</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                aria-label="Save"
                className="ed-btn-outline"
                style={{
                  width: 30,
                  height: 30,
                  border: "1px solid var(--ed-hairline)",
                  borderRadius: 6,
                  background: "transparent",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--ed-text-card-meta)",
                  transition: "background 200ms",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
              </button>
              <button
                aria-label="Share"
                className="ed-btn-outline"
                style={{
                  width: 30,
                  height: 30,
                  border: "1px solid var(--ed-hairline)",
                  borderRadius: 6,
                  background: "transparent",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--ed-text-card-meta)",
                  transition: "background 200ms",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            </div>
          </header>

          {/* Scrollable body */}
          <div className="ed-scroll" style={{ flex: 1, overflowY: "auto" }}>
            {/* Bias top-stripe */}
            <div style={{ height: 4, background: cfgColor }} />

            {/* Hero image */}
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16/9",
                overflow: "hidden",
                background:
                  "repeating-linear-gradient(135deg, oklch(0.92 0 0) 0 8px, oklch(0.88 0 0) 8px 16px)",
              }}
            >
              {article.image_url && (
                <img
                  src={article.image_url}
                  alt={article.title}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              )}
            </div>

            {/* Editorial column */}
            <article
              className="ed-article-col"
              style={{
                maxWidth: 720,
                margin: "0 auto",
                padding: "44px 32px 80px",
              }}
            >
              {/* Eyebrow row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 22,
                }}
              >
                <span
                  style={{
                    ...monoStyle,
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: cfgInk,
                    letterSpacing: "0.18em",
                  }}
                >
                  ◆ {article.category || "General"}
                </span>
                <span
                  style={{
                    width: 1,
                    height: 12,
                    background: "var(--ed-divider-strong)",
                  }}
                />
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    ...monoStyle,
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: cfgInk,
                    letterSpacing: "0.14em",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 4,
                      background: cfgColor,
                    }}
                  />
                  {article.bias ? BIAS_LABEL[bias] : "Unrated"}
                </span>
                {dateLabel && (
                  <>
                    <span
                      style={{
                        width: 1,
                        height: 12,
                        background: "var(--ed-divider-strong)",
                      }}
                    />
                    <span
                      style={{
                        ...monoStyle,
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: "var(--ed-text-muted)",
                        letterSpacing: "0.14em",
                      }}
                    >
                      {dateLabel}
                      {timeLabel ? ` · ${timeLabel}` : ""}
                    </span>
                  </>
                )}
              </div>

              {/* Headline */}
              <h1
                style={{
                  fontSize: 42,
                  lineHeight: 1.04,
                  letterSpacing: "-0.035em",
                  fontWeight: 800,
                  margin: 0,
                  color: "var(--ed-h1)",
                  textWrap: "balance",
                }}
              >
                {article.title}
              </h1>

              {/* Byline strip */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  marginTop: 22,
                  paddingTop: 18,
                  paddingBottom: 18,
                  borderTop: "1px solid var(--ed-divider-section)",
                  borderBottom: "1px solid var(--ed-divider-section)",
                }}
              >
                <SourceMark source={article.source} size={28} />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: "var(--ed-text-primary)",
                    }}
                  >
                    {article.source}
                  </span>
                  <span
                    style={{
                      ...monoStyle,
                      fontSize: 10,
                      fontWeight: 600,
                      color: "var(--ed-text-muted)",
                      letterSpacing: "0.14em",
                    }}
                  >
                    Verified outlet · {BIAS_LABEL[bias]} bias
                  </span>
                </div>
                <span style={{ flex: 1 }} />
                {relLabel && (
                  <span
                    style={{
                      ...monoStyle,
                      fontSize: 10.5,
                      fontWeight: 600,
                      color: "var(--ed-text-muted)",
                      letterSpacing: "0.14em",
                    }}
                  >
                    {relLabel}
                  </span>
                )}
              </div>

              {/* Standfirst */}
              {article.summary && (
                <p
                  style={{
                    fontSize: 19,
                    lineHeight: 1.5,
                    letterSpacing: "-0.005em",
                    color: "var(--ed-text-card-meta)",
                    margin: "26px 0 0",
                    fontWeight: 500,
                    textWrap: "pretty",
                  }}
                >
                  {article.summary}
                </p>
              )}

              {/* Drop-cap body */}
              {bodyParas.length > 0 && (
                <div
                  style={{
                    marginTop: 28,
                    fontSize: 16.5,
                    lineHeight: 1.7,
                    color: "var(--ed-text-card-meta)",
                  }}
                >
                  {bodyParas.map((p, i) => {
                    const isFirst = i === 0;
                    const firstChar = isFirst && p.length > 0 ? p.charAt(0) : "";
                    const rest = isFirst ? p.slice(1) : p;
                    return (
                      <p
                        key={i}
                        style={{
                          margin: i === 0 ? 0 : "1.1em 0 0",
                          textWrap: "pretty",
                        }}
                      >
                        {isFirst && firstChar && (
                          <span
                            style={{
                              float: "left",
                              fontFamily:
                                "var(--font-inter), Inter, sans-serif",
                              fontWeight: 800,
                              fontSize: 64,
                              lineHeight: 0.9,
                              paddingRight: 12,
                              paddingTop: 6,
                              letterSpacing: "-0.04em",
                              color: "var(--ed-h1)",
                            }}
                          >
                            {firstChar}
                          </span>
                        )}
                        {rest}
                      </p>
                    );
                  })}
                </div>
              )}

              {!article.summary && bodyParas.length === 0 && (
                <p
                  style={{
                    marginTop: 28,
                    ...monoStyle,
                    fontStyle: "italic",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--ed-text-muted)",
                    letterSpacing: "0.08em",
                  }}
                >
                  No preview available for this article.
                </p>
              )}

              {/* Preview-only note */}
              {(isTruncated || (bodyText && bodyText !== article.summary)) && (
                <div
                  style={{
                    marginTop: 32,
                    padding: "12px 14px",
                    borderLeft: `2px solid ${cfgColor}`,
                    background: "var(--ed-surface)",
                    ...monoStyle,
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--ed-text-muted)",
                    letterSpacing: "0.06em",
                  }}
                >
                  Preview only — content may be truncated by the news provider.
                </div>
              )}

              {/* CTA row */}
              <div
                style={{
                  marginTop: 36,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ed-btn-primary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "13px 18px",
                    background: "var(--ed-h1)",
                    color: "white",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "-0.005em",
                    transition: "background 200ms",
                  }}
                >
                  Read the full article on {article.source}
                  <svg
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
            </article>
          </div>
        </div>

        {/* ── RIGHT: Spectrum aside ─────────────────────── */}
        <BiasSpectrum
          topic={article.title}
          articles={[]}
          selectedBias={article.bias as Bias | null}
          selectedSource={article.source}
        />
      </div>
    </div>
  );
}
