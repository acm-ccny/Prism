import type { CSSProperties } from "react";

interface Props {
  src: string | null;
  alt: string;
  ratio?: string;
  style?: CSSProperties;
}

const PLACEHOLDER_BG =
  "repeating-linear-gradient(135deg, oklch(0.92 0 0) 0 8px, oklch(0.88 0 0) 8px 16px)";

export default function ArticleImage({
  src,
  alt,
  ratio = "16/9",
  style = {},
}: Props) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: ratio,
        overflow: "hidden",
        background: PLACEHOLDER_BG,
        ...style,
      }}
    >
      {src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
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
  );
}
