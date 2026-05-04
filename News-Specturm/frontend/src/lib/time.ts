export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diffMs = Date.now() - t;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH} hr ago`;
  const diffD = Math.round(diffH / 24);
  return `${diffD} day${diffD === 1 ? "" : "s"} ago`;
}

// Compact uppercase form for tight meta rows: "JUST NOW", "2M AGO", "5H AGO", "3D AGO".
export function formatRelativeShort(iso: string | null | undefined): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diffMs = Date.now() - t;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "JUST NOW";
  if (diffMin < 60) return `${diffMin}M AGO`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH}H AGO`;
  const diffD = Math.round(diffH / 24);
  return `${diffD}D AGO`;
}
