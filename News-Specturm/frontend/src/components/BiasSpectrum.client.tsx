"use client";
import SourceMark from "./editorial/SourceMark";

export interface SpectrumArticle {
  title: string;
  source: string;
  url: string;
  bias: "left" | "center" | "right";
  image_url?: string | null;
  published_at?: string | null;
}

type Side = "left" | "center" | "right";

interface Props {
  topic: string | null;
  articles: SpectrumArticle[];
  selectedBias: Side | null;
  selectedSource: string;
}

const SIDES: { key: Side; label: string }[] = [
  { key: "left", label: "Left" },
  { key: "center", label: "Center" },
  { key: "right", label: "Right" },
];

const monoStyle = {
  fontFamily: "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
  textTransform: "uppercase" as const,
};

const formatShortDate = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

function PositionCard({
  selectedBias,
  selectedSource,
}: {
  selectedBias: Side | null;
  selectedSource: string;
}) {
  const bias: Side = selectedBias ?? "center";
  const left = bias === "left" ? "10%" : bias === "right" ? "90%" : "50%";
  const inkVar = `var(--ed-bias-${bias}-ink)`;
  const labelMap: Record<Side, string> = {
    left: "Left",
    center: "Center",
    right: "Right",
  };

  return (
    <div
      style={{
        padding: "18px 22px 18px",
        borderBottom: "1px solid var(--ed-hairline)",
      }}
    >
      <span
        style={{
          ...monoStyle,
          fontSize: 10,
          fontWeight: 600,
          color: "var(--ed-text-muted)",
          letterSpacing: "0.14em",
        }}
      >
        This article
      </span>
      <div
        style={{
          marginTop: 6,
          display: "flex",
          alignItems: "center",
          gap: 9,
        }}
      >
        <SourceMark source={selectedSource} size={22} />
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--ed-text-primary)",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selectedSource}
        </span>
      </div>

      <div style={{ marginTop: 16, position: "relative", paddingTop: 14 }}>
        <div
          style={{
            height: 6,
            borderRadius: 6,
            background:
              "linear-gradient(90deg, var(--ed-bias-left-color) 0%, var(--ed-bias-center-color) 50%, var(--ed-bias-right-color) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 8,
            left,
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transition: "left 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderBottom: `6px solid ${inkVar}`,
            }}
          />
          <div
            style={{
              marginTop: 4,
              ...monoStyle,
              fontSize: 9.5,
              fontWeight: 700,
              color: inkVar,
              letterSpacing: "0.12em",
              whiteSpace: "nowrap",
            }}
          >
            {selectedBias ? labelMap[bias] : "Unrated"}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 30,
            ...monoStyle,
            fontSize: 9.5,
            fontWeight: 600,
            letterSpacing: "0.12em",
          }}
        >
          <span style={{ color: "var(--ed-bias-left-ink)" }}>Left</span>
          <span style={{ color: "var(--ed-bias-center-ink)" }}>Center</span>
          <span style={{ color: "var(--ed-bias-right-ink)" }}>Right</span>
        </div>
      </div>
    </div>
  );
}

function SideSection({
  side,
  items,
  isLast,
}: {
  side: Side;
  items: SpectrumArticle[];
  isLast: boolean;
}) {
  const colorVar = `var(--ed-bias-${side}-color)`;
  const inkVar = `var(--ed-bias-${side}-ink)`;
  const labelMap: Record<Side, string> = {
    left: "Left",
    center: "Center",
    right: "Right",
  };
  const countLabel =
    items.length === 0
      ? "—"
      : items.length === 1
        ? "1 source"
        : `${items.length} sources`;
  const headline = items[0];
  const extras = items.slice(1);

  return (
    <div
      style={{
        padding: "18px 22px",
        borderBottom: isLast ? "none" : "1px solid var(--ed-hairline)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 3,
              height: 14,
              borderRadius: 2,
              background: colorVar,
            }}
          />
          <span
            style={{
              ...monoStyle,
              fontSize: 11,
              fontWeight: 700,
              color: inkVar,
              letterSpacing: "0.16em",
            }}
          >
            {labelMap[side]}
          </span>
        </div>
        <span
          style={{
            ...monoStyle,
            fontSize: 10,
            fontWeight: 600,
            color: "var(--ed-text-muted)",
            letterSpacing: "0.1em",
          }}
        >
          {countLabel}
        </span>
      </div>

      {headline ? (
        <>
          <a
            href={headline.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ed-related"
            style={{
              display: "block",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <SourceMark source={headline.source} size={18} />
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "var(--ed-text-card-meta)",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  minWidth: 0,
                  flex: 1,
                }}
              >
                {headline.source}
              </span>
              {headline.published_at && (
                <span
                  style={{
                    ...monoStyle,
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--ed-text-muted)",
                    letterSpacing: "0.08em",
                    flexShrink: 0,
                  }}
                >
                  {formatShortDate(headline.published_at)}
                </span>
              )}
            </div>
            <p
              className="ed-related-title"
              style={{
                margin: 0,
                fontSize: 13.5,
                fontWeight: 600,
                lineHeight: 1.32,
                letterSpacing: "-0.012em",
                color: "var(--ed-text-primary)",
                textWrap: "pretty",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                fontFamily: "var(--font-inter), Inter, sans-serif",
              }}
            >
              {headline.title}
            </p>
          </a>

          {extras.length > 0 && (
            <div
              style={{
                marginTop: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {extras.map((a) => (
                <a
                  key={a.url}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ed-related"
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <SourceMark source={a.source} size={16} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p
                      className="ed-related-title"
                      style={{
                        margin: 0,
                        fontSize: 12,
                        fontWeight: 500,
                        lineHeight: 1.3,
                        color: "var(--ed-text-primary)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        fontFamily: "var(--font-inter), Inter, sans-serif",
                      }}
                    >
                      {a.title}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        ...monoStyle,
                        fontSize: 10,
                        fontWeight: 500,
                        color: "var(--ed-text-muted)",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {a.source}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        <p
          style={{
            margin: 0,
            fontFamily:
              "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
            fontStyle: "italic",
            fontSize: 10.5,
            fontWeight: 500,
            color: "var(--ed-text-dim)",
            letterSpacing: "0.1em",
          }}
        >
          No coverage yet from this side.
        </p>
      )}
    </div>
  );
}

export default function BiasSpectrum({
  topic,
  articles,
  selectedBias,
  selectedSource,
}: Props) {
  const byBias: Record<Side, SpectrumArticle[]> = {
    left: articles.filter((a) => a.bias === "left"),
    center: articles.filter((a) => a.bias === "center"),
    right: articles.filter((a) => a.bias === "right"),
  };

  const description = topic
    ? "Three takes on the same story, side by side."
    : "Select a story to compare coverage.";

  return (
    <aside
      className="ed-spectrum-aside"
      style={{
        width: 320,
        flexShrink: 0,
        height: "100%",
        background: "var(--ed-surface)",
        borderLeft: "1px solid var(--ed-hairline)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-inter), Inter, sans-serif",
      }}
    >
      <div
        style={{
          padding: "20px 22px 18px",
          borderBottom: "1px solid var(--ed-hairline)",
        }}
      >
        <span
          style={{
            ...monoStyle,
            fontSize: 10.5,
            fontWeight: 600,
            color: "var(--ed-text-muted)",
            letterSpacing: "0.18em",
          }}
        >
          ◆ The Spectrum
        </span>
        <h2
          style={{
            margin: "8px 0 4px",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "-0.025em",
            color: "var(--ed-h1)",
          }}
        >
          How the desks framed it
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 12.5,
            lineHeight: 1.5,
            color: "var(--ed-text-body)",
          }}
        >
          {description}
        </p>
      </div>

      <PositionCard
        selectedBias={selectedBias}
        selectedSource={selectedSource}
      />

      <div className="ed-scroll" style={{ flex: 1, overflowY: "auto" }}>
        {SIDES.map((s, i) => (
          <SideSection
            key={s.key}
            side={s.key}
            items={byBias[s.key]}
            isLast={i === SIDES.length - 1}
          />
        ))}
      </div>
    </aside>
  );
}
