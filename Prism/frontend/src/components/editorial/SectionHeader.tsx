interface Props {
  label: string;
  right?: string;
}

export default function SectionHeader({ label, right }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        marginBottom: 18,
        paddingBottom: 10,
        borderBottom: "1px solid var(--ed-divider-section)",
      }}
    >
      <h2
        style={{
          fontSize: 13,
          fontFamily:
            "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          margin: 0,
          color: "var(--ed-text-accent)",
          fontWeight: 700,
        }}
      >
        ◆ {label}
      </h2>
      {right && (
        <span
          style={{
            fontFamily:
              "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
            fontSize: 11,
            color: "var(--ed-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {right}
        </span>
      )}
    </div>
  );
}
