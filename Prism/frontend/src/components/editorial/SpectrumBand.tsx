import type { Article } from "../../lib/types";
import BiasDistribution from "./BiasDistribution";

interface Props {
  articles: Article[];
}

export default function SpectrumBand({ articles }: Props) {
  const today = new Date();
  const dateLabel = `${today.getMonth() + 1}/${String(today.getDate()).padStart(2, "0")}`;
  const sourceCount = new Set(articles.map((a) => a.source)).size;

  return (
    <div
      style={{
        background: "var(--ed-surface)",
        borderBottom: "1px solid var(--ed-hairline)",
      }}
    >
      <div
        className="ed-spectrum-band"
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "22px 28px 24px",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: 32,
          alignItems: "center",
          fontFamily: "var(--font-inter), Inter, sans-serif",
        }}
      >
        <div>
          <div
            style={{
              fontFamily:
                "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
              fontSize: 10.5,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "var(--ed-text-muted)",
              fontWeight: 600,
            }}
          >
            The Spectrum · {dateLabel}
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "-0.015em",
              marginTop: 2,
              color: "var(--ed-text-primary)",
            }}
          >
            Today&apos;s coverage skew
          </div>
        </div>
        <div style={{ minWidth: 0 }}>
          <BiasDistribution articles={articles} variant="spectrum" height={10} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily:
              "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
            fontSize: 11,
            color: "var(--ed-text-body)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            whiteSpace: "nowrap",
          }}
        >
          <span>{articles.length} stories</span>
          <span style={{ color: "var(--ed-divider-strong)" }}>|</span>
          <span>{sourceCount} sources</span>
        </div>
      </div>
    </div>
  );
}
