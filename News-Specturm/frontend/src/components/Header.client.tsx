"use client";
import { useState } from "react";
import Link from "next/link";

export default function HeaderClient() {
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <header
      className="px-6 py-3.5 flex items-center gap-4 shrink-0 border-b backdrop-blur-sm"
      style={{
        background: "var(--d-header)",
        borderColor: "var(--d-border)",
        boxShadow: "var(--d-header-shadow)",
      }}
    >
      {/* Search bar */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-2xl">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--d-text-muted)" }}
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search articles, topics, sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border pl-9 pr-4 py-2 text-sm outline-none transition-all"
            style={{
              background: "var(--d-input)",
              borderColor: "var(--d-border)",
              color: "var(--d-text)",
            }}
          />
        </div>
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={toggleDark}
        className="shrink-0 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
        style={{
          background: "var(--d-hover)",
          borderColor: "var(--d-border)",
          color: isDark ? "#facc15" : "var(--d-text-muted)",
        }}
        aria-label="Toggle dark mode"
      >
        {isDark ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <span className="hidden sm:inline">Light</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            <span className="hidden sm:inline">Dark</span>
          </>
        )}
      </button>

      <Link
        href="/signup"
        className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 shadow-sm shadow-blue-200"
      >
        Sign Up
      </Link>
    </header>
  );
}
