type Bias = "left" | "center" | "right";

interface Props {
  bias: Bias | null;
  size?: "sm" | "dot";
  dark?: boolean;
}

const LABELS: Record<Bias, string> = {
  left: "Left",
  center: "Center",
  right: "Right",
};

export default function BiasPill({ bias, size = "sm", dark = false }: Props) {
  const b: Bias = bias ?? "center";
  const colorVar = `var(--ed-bias-${b}-color)`;
  const softVar = dark
    ? `var(--ed-bias-${b}-soft-dark)`
    : `var(--ed-bias-${b}-soft)`;
  const inkVar = dark ? colorVar : `var(--ed-bias-${b}-ink)`;

  if (size === "dot") {
    return (
      <span
        style={{
          display: "inline-block",
          width: 7,
          height: 7,
          borderRadius: 4,
          background: colorVar,
        }}
      />
    );
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 10.5,
        fontWeight: 600,
        fontFamily: "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        background: softVar,
        color: inkVar,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{ width: 5, height: 5, borderRadius: 3, background: colorVar }}
      />
      {LABELS[b]}
    </span>
  );
}
