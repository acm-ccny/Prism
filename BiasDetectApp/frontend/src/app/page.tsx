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

const cardGradients = [
  "from-violet-900/40 via-zinc-900 to-zinc-800",
  "from-cyan-900/40 via-zinc-900 to-zinc-800",
  "from-rose-900/40 via-zinc-900 to-zinc-800",
  "from-amber-900/40 via-zinc-900 to-zinc-800",
  "from-emerald-900/40 via-zinc-900 to-zinc-800",
  "from-blue-900/40 via-zinc-900 to-zinc-800",
  "from-fuchsia-900/40 via-zinc-900 to-zinc-800",
  "from-teal-900/40 via-zinc-900 to-zinc-800",
  "from-orange-900/40 via-zinc-900 to-zinc-800",
  "from-indigo-900/40 via-zinc-900 to-zinc-800",
  "from-pink-900/40 via-zinc-900 to-zinc-800",
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
        {/* Logo + toggle row */}
        <div className="flex items-center justify-between px-3 pt-3 pb-1">
          {sidebarOpen && (
            <div className="flex items-center gap-2 pl-1">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-sm font-semibold tracking-tight text-zinc-100">BiasDetect</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-100 ml-auto"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        <div className={`${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"} transition-opacity duration-300 px-3 pt-4 pb-4`}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 px-2 mb-2">Categories</p>
          <nav className="flex flex-col gap-0.5">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex items-center gap-3 rounded-md px-2.5 py-2 text-sm whitespace-nowrap transition-colors ${
                  activeCategory === cat.name
                    ? "bg-blue-500/15 text-blue-400 font-medium"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={cat.icon} />
                </svg>
                {cat.name}
                {activeCategory === cat.name && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom section */}
        <div className={`${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"} transition-opacity duration-300 mt-auto border-t border-zinc-800/60 p-3`}>
          <div className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-zinc-500 hover:bg-zinc-800 transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 flex items-center justify-center text-xs text-zinc-300 font-medium shrink-0">
              G
            </div>
            <div className="min-w-0">
              <p className="text-xs text-zinc-300 whitespace-nowrap font-medium">Guest User</p>
              <p className="text-[10px] text-zinc-600 whitespace-nowrap">Not signed in</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-950">
        {/* Top bar */}
        <header className="px-6 py-3.5 flex items-center gap-4 shrink-0 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm">
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-2xl">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search articles, topics, sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-9 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>
          <Link
            href="/page-light"
            className="shrink-0 text-xs text-zinc-600 hover:text-zinc-400 transition-colors hidden sm:block"
          >
            Light version
          </Link>
          <Link
            href="/signup"
            className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 shadow-lg shadow-blue-900/30"
          >
            Sign Up
          </Link>
        </header>

        {/* Scrollable content */}
        <section className="flex-1 overflow-y-auto p-6">
          {/* Section heading */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                {activeCategory === "Home" ? "Latest Stories" : activeCategory}
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">Stay informed. Detect bias.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">{articles.length} articles</span>
            </div>
          </div>

          {/* Featured card */}
          <div className="mb-5 rounded-2xl border border-zinc-800/60 bg-zinc-900 overflow-hidden hover:border-zinc-700 transition-all cursor-pointer group">
            <div className="h-52 bg-gradient-to-br from-blue-600/25 via-zinc-900 to-indigo-900/20 relative flex flex-col justify-end p-5">
              {/* Decorative grid */}
              <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)", backgroundSize: "32px 32px"}} />
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-zinc-950/60 backdrop-blur-sm rounded-full px-3 py-1 border border-zinc-700/50">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-medium text-zinc-300 uppercase tracking-wider">Featured</span>
              </div>
              <div className="relative">
                <div className="h-2.5 w-24 bg-zinc-700/60 rounded mb-2" />
                <div className="h-4 w-64 bg-zinc-700/40 rounded mb-1.5" />
                <div className="h-3 w-48 bg-zinc-800/60 rounded" />
              </div>
            </div>
            <div className="px-5 py-3.5 flex items-center justify-between border-t border-zinc-800/40">
              <div className="flex items-center gap-3">
                <div className="h-2 w-16 bg-zinc-800 rounded" />
                <div className="h-2 w-10 bg-zinc-800 rounded" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 group-hover:text-blue-400 transition-colors">
                <span>Read more</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Article grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.slice(1).map((article, i) => (
              <div
                key={article.id}
                className="rounded-xl border border-zinc-800/60 bg-zinc-900 overflow-hidden hover:border-zinc-700 transition-all hover:-translate-y-0.5 cursor-pointer group"
              >
                <div className={`h-28 bg-gradient-to-br ${cardGradients[i % cardGradients.length]} relative`}>
                  <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "18px 18px"}} />
                </div>
                <div className="p-3.5">
                  <div className="h-2 w-14 bg-zinc-800 rounded mb-2" />
                  <div className="h-2.5 w-full bg-zinc-800/70 rounded mb-1.5" />
                  <div className="h-2.5 w-4/5 bg-zinc-800/50 rounded" />
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/40">
                    <div className="h-1.5 w-10 bg-zinc-800 rounded" />
                    <div className="h-1.5 w-8 bg-zinc-800 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
