import type { Article } from "../../lib/types";

type Bias = "left" | "center" | "right";

const LABELS: Record<Bias, string> = {
  left: "Left",
  center: "Center",
  right: "Right",
};

export function biasCounts(articles: Article[]): Record<Bias, number> {
  const c: Record<Bias, number> = { left: 0, center: 0, right: 0 };
  for (const a of articles) {
    if (a.bias === "left" || a.bias === "center" || a.bias === "right") {
      c[a.bias] += 1;
    }
  }
  return c;
}

interface Props {
  articles: Article[];
  variant?: "segmented" | "spectrum";
  dark?: boolean;
  height?: number;
}

export default function BiasDistribution({
  articles,
  variant = "segmented",
  dark = false,
  height = 8,
}: Props) {
  const c = biasCounts(articles);
  const total = c.left + c.center + c.right || 1;
  const pct = {
    left: (c.left / total) * 100,
    center: (c.center / total) * 100,
    right: (c.right / total) * 100,
  };

  if (variant === "spectrum") {
    const stops = `linear-gradient(90deg,
      var(--ed-bias-left-color) 0%,
      var(--ed-bias-left-color) ${pct.left}%,
      var(--ed-bias-center-color) ${pct.left}%,
      var(--ed-bias-center-color) ${pct.left + pct.center}%,
      var(--ed-bias-right-color) ${pct.left + pct.center}%,
      var(--ed-bias-right-color) 100%)`;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            height,
            borderRadius: height,
            background: stops,
            transition: "background 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily:
              "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
            fontSize: 11,
            color: dark ? "oklch(0.7 0 0)" : "var(--ed-text-body)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          <span style={{ color: "var(--ed-bias-left-color)" }}>
            ← Left · {c.left}
          </span>
          <span>Center · {c.center}</span>
          <span style={{ color: "var(--ed-bias-right-color)" }}>
            {c.right} · Right →
          </span>
        </div>
      </div>
    );
  }

  const order: Bias[] = ["left", "center", "right"];
  return (
    <div style={{ display: "flex", gap: 4, height: 32 }}>
      {order.map((b) => (
        <div
          key={b}
          style={{
            flex: total ? c[b] || 0.3 : 1,
            background: dark
              ? `var(--ed-bias-${b}-soft-dark)`
              : `var(--ed-bias-${b}-soft)`,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 10px",
            minWidth: 60,
            transition: "flex 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              fontWeight: 600,
              color: `var(--ed-bias-${b}-ink)`,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                background: `var(--ed-bias-${b}-color)`,
              }}
            />
            {LABELS[b]}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              fontFamily:
                "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
              color: `var(--ed-bias-${b}-ink)`,
            }}
          >
            {c[b]}
          </span>
        </div>
      ))}
    </div>
  );
}
