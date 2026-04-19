"use client";
import type { Article } from "../lib/types";
import BiasTag from "./BiasTag"

interface Props {
  article: Article;
  index: number;
  onClick: () => void;
}

export default function ArticleCard({ article, onClick }: Props) {
  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer group flex flex-col"
    >
      {/* Image */}
      <div
        className="rounded-lg overflow-hidden mb-3 shrink-0"
        style={{ aspectRatio: "3 / 2" }}
      >
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="w-full h-full flex items-end p-3"
            style={{ background: "var(--d-hover)" }}
          >
            <span
              className="text-3xl font-black select-none"
              style={{ color: "var(--d-border)", lineHeight: 1 }}
            >
              {article.source.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Headline */}
      <h2
        className="text-sm font-semibold leading-snug line-clamp-3 mb-2 transition-colors duration-150 group-hover:text-blue-500"
        style={{ color: "var(--d-text)" }}
      >
        {article.title}
      </h2>

      {/* Byline */}
      <p className="text-xs mt-auto" style={{ color: "var(--d-text-muted)" }}>
        {article.source}
        {formattedDate && (
          <span style={{ color: "var(--d-border)" }}> | </span>
        )}
        {formattedDate}
        { article.bias || (
          <>
          <span style = {{color: "var(--d-border)"}}> | </span>
          <BiasTag bias={"right"} />
          </>
        
        )}
      </p>
    </div>
  );
}
