"use client";
import type { Article } from "../../lib/types";
import ArticleImage from "./ArticleImage";
import BiasPill from "./BiasPill";
import SourceMark from "./SourceMark";

type Bias = "left" | "center" | "right";
type Size = "xl" | "lg" | "md" | "sm";

interface Props {
  article: Article;
  size?: Size;
  overlay?: boolean;
  onClick?: () => void;
}

const SIZING: Record<
  Size,
  {
    ratio: string;
    titleSize: number;
    summarySize: number;
    lineClamp: number;
    padding: number;
  }
> = {
  xl: { ratio: "16/10", titleSize: 36, summarySize: 16, lineClamp: 4, padding: 26 },
  lg: { ratio: "4/3", titleSize: 24, summarySize: 14, lineClamp: 3, padding: 20 },
  md: { ratio: "16/10", titleSize: 17, summarySize: 13, lineClamp: 2, padding: 16 },
  sm: { ratio: "16/10", titleSize: 14.5, summarySize: 12.5, lineClamp: 2, padding: 14 },
};

const formatDate = (iso: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const estimateMinutes = (a: Article): number => {
  const text = a.content || a.summary || "";
  const words = text.split(/\s+/).filter(Boolean).length;
  if (!words) return 0;
  return Math.max(1, Math.round(words / 220));
};

export default function EdCard({
  article,
  size = "md",
  overlay = false,
  onClick,
}: Props) {
  const bias: Bias = (article.bias as Bias | null) ?? "center";
  const cfgColor = `var(--ed-bias-${bias}-color)`;
  const cfgInk = `var(--ed-bias-${bias}-ink)`;
  const sizing = SIZING[size];
  const minutes = estimateMinutes(article);
  const dateLabel = formatDate(article.published_at);

  const handleClick = () => {
    if (onClick) onClick();
  };

  if (overlay) {
    return (
      <article
        onClick={handleClick}
        className="ed-card-overlay"
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 12,
          cursor: "pointer",
          minHeight: 420,
          height: "100%",
        }}
      >
        <ArticleImage
          src={article.image_url}
          alt={article.title}
          ratio="auto"
          style={{
            aspectRatio: "auto",
            height: "100%",
            position: "absolute",
            inset: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, oklch(0 0 0 / 0.05) 0%, oklch(0 0 0 / 0.1) 40%, oklch(0 0 0 / 0.85) 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: cfgColor,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 18,
            left: 22,
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              background: "white",
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily:
                "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
              color: cfgInk,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
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
            {bias.charAt(0).toUpperCase() + bias.slice(1)}
          </span>
          {article.category && (
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                background: "oklch(1 0 0 / 0.18)",
                backdropFilter: "blur(8px)",
                border: "1px solid oklch(1 0 0 / 0.3)",
                color: "white",
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily:
                  "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
              }}
            >
              {article.category}
            </span>
          )}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "26px 28px 28px",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
              fontSize: 12.5,
              color: "oklch(1 0 0 / 0.85)",
              flexWrap: "wrap",
              fontFamily: "var(--font-inter), Inter, sans-serif",
            }}
          >
            <SourceMark source={article.source} size={22} dark />
            <span style={{ fontWeight: 600 }}>{article.source}</span>
            {dateLabel && (
              <>
                <span style={{ opacity: 0.6 }}>·</span>
                <span>{dateLabel}</span>
              </>
            )}
            {minutes > 0 && (
              <>
                <span style={{ opacity: 0.6 }}>·</span>
                <span
                  style={{
                    fontFamily:
                      "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
                    fontSize: 11,
                    letterSpacing: "0.04em",
                  }}
                >
                  {minutes} MIN
                </span>
              </>
            )}
          </div>
          <h2
            style={{
              fontSize: sizing.titleSize,
              lineHeight: 1.06,
              letterSpacing: "-0.025em",
              fontWeight: 800,
              margin: 0,
              maxWidth: 720,
              textWrap: "balance",
              textShadow: "0 1px 8px oklch(0 0 0 / 0.3)",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              color: "white",
            }}
          >
            {article.title}
          </h2>
          {article.summary && (
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.5,
                color: "oklch(1 0 0 / 0.82)",
                margin: "12px 0 0",
                maxWidth: 640,
                textWrap: "pretty",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                fontFamily: "var(--font-inter), Inter, sans-serif",
              }}
            >
              {article.summary}
            </p>
          )}
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={handleClick}
      className="ed-card"
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--ed-card)",
        border: "1px solid var(--ed-card-border)",
        borderTop: `3px solid ${cfgColor}`,
        borderRadius: 10,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        height: "100%",
      }}
    >
      <ArticleImage
        src={article.image_url}
        alt={article.title}
        ratio={sizing.ratio}
      />
      <div
        style={{
          padding: sizing.padding,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          flex: 1,
          fontFamily: "var(--font-inter), Inter, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            color: "var(--ed-text-muted)",
            flexWrap: "wrap",
          }}
        >
          <SourceMark source={article.source} size={18} />
          <span style={{ fontWeight: 600, color: "var(--ed-text-card-meta)" }}>
            {article.source}
          </span>
          <span>·</span>
          <BiasPill bias={article.bias as Bias | null} />
        </div>
        <h3
          style={{
            fontSize: sizing.titleSize,
            lineHeight: 1.18,
            letterSpacing: "-0.02em",
            fontWeight: 700,
            margin: 0,
            color: "var(--ed-text-primary)",
            textWrap: "pretty",
            display: "-webkit-box",
            WebkitLineClamp: sizing.lineClamp,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title}
        </h3>
        {(size === "lg" || size === "xl") && article.summary && (
          <p
            style={{
              fontSize: sizing.summarySize,
              lineHeight: 1.5,
              color: "var(--ed-text-body)",
              margin: 0,
              textWrap: "pretty",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {article.summary}
          </p>
        )}
        <div
          style={{
            marginTop: "auto",
            paddingTop: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily:
              "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
            fontSize: 10.5,
            color: "var(--ed-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          <span>{dateLabel || "—"}</span>
          {minutes > 0 && <span>{minutes} min</span>}
        </div>
      </div>
    </article>
  );
}
