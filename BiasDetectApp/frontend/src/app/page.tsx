"use client";
import { useState } from "react";
import Link from "next/link";

const categories = [
  { name: "Home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" },
  { name: "Politics", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" },
  { name: "Technology", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { name: "Sports", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { name: "Science", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
  { name: "Business", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
];

const articles = Array.from({ length: 12 }, (_, i) => ({ id: i + 1 }));

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Home");

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-56" : "w-12"} shrink-0 border-r border-zinc-800/60 bg-zinc-900 flex flex-col transition-all duration-300`}
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2.5 m-1 self-end rounded-md hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-100"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className={`${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"} transition-opacity duration-300 px-3 pb-4`}>
          <h2 className="text-base font-bold mb-6 px-2 whitespace-nowrap tracking-wide text-blue-400">
            Name
          </h2>
          <nav className="flex flex-col gap-0.5">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex items-center gap-3 rounded-md px-2.5 py-2 text-sm whitespace-nowrap transition-colors ${
                  activeCategory === cat.name
                    ? "bg-blue-500/15 text-blue-400"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={cat.icon} />
                </svg>
                {cat.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom section */}
        <div className={`${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"} transition-opacity duration-300 mt-auto border-t border-zinc-800/60 p-3`}>
          <div className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-zinc-500">
            <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-300">
              ?
            </div>
            <span className="whitespace-nowrap">Guest User</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-950">
        {/* Top bar */}
        <header className="px-6 py-4 flex items-center gap-4 shrink-0 border-b border-zinc-800/60">
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-2xl">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-900 pl-9 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </div>
          <Link
            href="/signup"
            className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            Sign Up
          </Link>
        </header>

        {/* Scrollable content */}
        <section className="flex-1 overflow-y-auto p-6">
          {/* Section heading */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold">
                {activeCategory === "Home" ? "Latest Stories" : activeCategory}
              </h1>
              <p className="text-sm text-zinc-500 mt-1">Stay informed. Detect bias.</p>
            </div>
            <span className="text-xs text-zinc-600">{articles.length} articles</span>
          </div>

          {/* Featured card */}
          <div className="mb-6 rounded-xl border border-zinc-800/60 bg-zinc-900 overflow-hidden hover:border-zinc-700 transition-colors cursor-pointer">
            <div className="h-48 bg-gradient-to-br from-blue-600/20 via-zinc-900 to-zinc-800 flex items-center justify-center">
              <span className="text-zinc-600 text-sm">Empty Article</span>
            </div>
          </div>

          {/* Article grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.slice(1).map((article) => (
              <div
                key={article.id}
                className="rounded-xl border border-zinc-800/60 bg-zinc-900 overflow-hidden hover:border-zinc-700 transition-all hover:-translate-y-0.5 cursor-pointer h-48 flex items-center justify-center"
              >
                <span className="text-zinc-600 text-sm">Empty Article</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
