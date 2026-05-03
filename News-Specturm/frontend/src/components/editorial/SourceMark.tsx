interface Props {
  source: string;
  size?: number;
  dark?: boolean;
}

export default function SourceMark({ source, size = 22, dark = false }: Props) {
  const initials = source
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  let h = 0;
  for (let i = 0; i < source.length; i++) {
    h = (h * 31 + source.charCodeAt(i)) % 360;
  }

  const bg = `oklch(${dark ? 0.32 : 0.92} 0.04 ${h})`;
  const fg = `oklch(${dark ? 0.78 : 0.32} 0.08 ${h})`;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: 6,
        background: bg,
        color: fg,
        fontSize: size * 0.42,
        fontFamily: "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
        fontWeight: 700,
        letterSpacing: "-0.02em",
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      {initials || "?"}
    </span>
  );
}
