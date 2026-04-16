"use client";

export interface SpectrumArticle {
  title: string;
  source: string;
  url: string;
  bias: "left" | "center" | "right";
  image_url?: string | null;
  published_at?: string | null;
}

interface Props {
  topic: string | null;
  articles: SpectrumArticle[];
}

const SIDES = [
  {
    key: "left" as const,
    label: "Left",
    color: "#3b82f6",
    fg: "var(--d-bias-left-color)",
  },
  {
    key: "center" as const,
    label: "Center",
    color: "#94a3b8",
    fg: "var(--d-text-muted)",
  },
  {
    key: "right" as const,
    label: "Right",
    color: "#ef4444",
    fg: "var(--d-bias-right-color)",
  },
];

export default function BiasSpectrum({ topic, articles }: Props) {
  const byBias = {
    left: articles.filter((a) => a.bias === "left"),
    center: articles.filter((a) => a.bias === "center"),
    right: articles.filter((a) => a.bias === "right"),
  };

  return (
    <div
      className="flex flex-col h-full border-l"
      style={{ borderColor: "var(--d-border)", background: "var(--d-surface)" }}
    >
      {/* Header */}
      <div
        className="shrink-0 px-5 pt-5 pb-4 border-b"
        style={{ borderColor: "var(--d-border)" }}
      >
        <h2
          className="text-sm font-semibold mb-1"
          style={{ color: "var(--d-text)" }}
        >
          The Spectrum
        </h2>
        <p className="text-xs leading-relaxed" style={{ color: "var(--d-text-muted)" }}>
          {topic
            ? "How different outlets cover this story"
            : "Select a story to compare coverage"}
        </p>
      </div>

      {/* Spectrum bar */}
      <div
        className="shrink-0 px-5 py-4 border-b"
        style={{ borderColor: "var(--d-border)" }}
      >
        <div
          className="h-1 rounded-full"
          style={{
            background: "linear-gradient(to right, #3b82f6, #94a3b8, #ef4444)",
          }}
        />
        <div className="flex justify-between mt-2">
          {SIDES.map((s) => (
            <span key={s.key} className="text-[11px]" style={{ color: s.color }}>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto">
        {SIDES.map((side, idx) => {
          const items = byBias[side.key];
          return (
            <div
              key={side.key}
              className="px-5 py-4"
              style={{
                borderBottom:
                  idx < SIDES.length - 1
                    ? `1px solid var(--d-border)`
                    : undefined,
              }}
            >
              {/* Section label — thin color bar + text */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-0.5 h-4 rounded-full shrink-0"
                  style={{ background: side.color }}
                />
                <span
                  className="text-xs font-semibold"
                  style={{ color: side.fg }}
                >
                  {side.label}
                </span>
              </div>

              {/* Articles */}
              {items.length > 0 ? (
                <div className="flex flex-col gap-3.5">
                  {items.map((a) => (
                    <a
                      key={a.url}
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block no-underline"
                    >
                      <p
                        className="text-[12px] font-medium leading-snug line-clamp-2 mb-0.5 transition-colors group-hover:text-blue-500"
                        style={{ color: "var(--d-text)" }}
                      >
                        {a.title}
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: "var(--d-text-muted)" }}
                      >
                        {a.source}
                      </p>
                    </a>
                  ))}
                </div>
              ) : (
                <p
                  className="text-xs italic"
                  style={{ color: "var(--d-text-sub)" }}
                >
                  No sources yet
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
