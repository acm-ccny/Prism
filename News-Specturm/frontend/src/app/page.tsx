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

const lightCardAccents = [
  "from-violet-50 to-purple-50/30",
  "from-cyan-50 to-sky-50/30",
  "from-rose-50 to-pink-50/30",
  "from-amber-50 to-yellow-50/30",
  "from-emerald-50 to-green-50/30",
  "from-blue-50 to-indigo-50/30",
  "from-fuchsia-50 to-pink-50/30",
  "from-teal-50 to-cyan-50/30",
  "from-orange-50 to-amber-50/30",
  "from-indigo-50 to-blue-50/30",
  "from-pink-50 to-rose-50/30",
];

const darkCardAccents = [
  "from-violet-900/30 to-purple-900/10",
  "from-cyan-900/30 to-sky-900/10",
  "from-rose-900/30 to-pink-900/10",
  "from-amber-900/30 to-yellow-900/10",
  "from-emerald-900/30 to-green-900/10",
  "from-blue-900/30 to-indigo-900/10",
  "from-fuchsia-900/30 to-pink-900/10",
  "from-teal-900/30 to-cyan-900/10",
  "from-orange-900/30 to-amber-900/10",
  "from-indigo-900/30 to-blue-900/10",
  "from-pink-900/30 to-rose-900/10",
];

const lightCardBorders = [
  "border-violet-100", "border-cyan-100", "border-rose-100", "border-amber-100",
  "border-emerald-100", "border-blue-100", "border-fuchsia-100", "border-teal-100",
  "border-orange-100", "border-indigo-100", "border-pink-100",
];

// True neutral dark borders — no blue tint
const D = {
  bg: "#0a0a0a",         // page background
  surface: "#111111",    // sidebar, cards
  header: "#111111",     // top bar
  border: "#222222",     // dividers
  hover: "#1c1c1c",      // hover states
  input: "#161616",      // search input bg
  skeleton: "#1e1e1e",   // skeleton bars
  skeletonSoft: "#1a1a1a",
  text: "#e5e5e5",
  textMuted: "#555555",
  textSub: "#333333",
};

const articles = Array.from({ length: 12 }, (_, i) => ({ id: i + 1 }));

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Home");
  const [dark, setDark] = useState(false);

  const cardAccents = dark ? darkCardAccents : lightCardAccents;

  return (
    <div
      className={`flex h-screen ${dark ? "text-gray-100" : "bg-gray-50 text-gray-900"}`}
      style={dark ? { background: D.bg } : {}}
    >
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-56" : "w-12"} shrink-0 border-r flex flex-col transition-all duration-300 ${
          dark ? "" : "border-gray-200 bg-white"
        }`}
        style={dark ? { background: D.surface, borderColor: D.border, boxShadow: "2px 0 8px 0 rgba(0,0,0,0.4)" } : { boxShadow: "2px 0 8px 0 rgba(0,0,0,0.04)" }}
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
              <span className={`text-sm font-semibold tracking-tight ${dark ? "" : "text-gray-800"}`} style={dark ? { color: D.text } : {}}>BiasDetect</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-md transition-colors ml-auto ${dark ? "" : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"}`}
            style={dark ? { color: D.textMuted } : {}}
            onMouseEnter={dark ? (e) => { (e.currentTarget as HTMLButtonElement).style.background = D.hover; } : undefined}
            onMouseLeave={dark ? (e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; } : undefined}
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
          <p className={`text-[10px] font-semibold uppercase tracking-widest px-2 mb-2 ${dark ? "" : "text-gray-400"}`} style={dark ? { color: D.textSub } : {}}>Categories</p>
          <nav className="flex flex-col gap-0.5">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex items-center gap-3 rounded-md px-2.5 py-2 text-sm whitespace-nowrap transition-colors ${
                  activeCategory === cat.name
                    ? dark ? "" : "bg-blue-50 text-blue-700 font-medium"
                    : dark ? "" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
                style={
                  dark
                    ? activeCategory === cat.name
                      ? { background: "#1a1a3a", color: "#60a5fa", fontWeight: 500 }
                      : { color: D.textMuted }
                    : {}
                }
                onMouseEnter={
                  dark && activeCategory !== cat.name
                    ? (e) => { (e.currentTarget as HTMLButtonElement).style.background = D.hover; (e.currentTarget as HTMLButtonElement).style.color = D.text; }
                    : undefined
                }
                onMouseLeave={
                  dark && activeCategory !== cat.name
                    ? (e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = D.textMuted; }
                    : undefined
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={cat.icon} />
                </svg>
                {cat.name}
                {activeCategory === cat.name && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom section */}
        <div
          className={`${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"} transition-opacity duration-300 mt-auto border-t p-3 ${dark ? "" : "border-gray-200"}`}
          style={dark ? { borderColor: D.border } : {}}
        >
          <div className={`flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors cursor-pointer ${dark ? "" : "text-gray-500 hover:bg-gray-50"}`}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ background: "#2a2a2a", color: "#888" }}>
              G
            </div>
            <div className="min-w-0">
              <p className={`text-xs whitespace-nowrap font-medium ${dark ? "" : "text-gray-700"}`} style={dark ? { color: D.text } : {}}>Guest User</p>
              <p className={`text-[10px] whitespace-nowrap ${dark ? "" : "text-gray-400"}`} style={dark ? { color: D.textMuted } : {}}>Not signed in</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 flex flex-col min-w-0 overflow-hidden ${dark ? "" : "bg-gray-50"}`} style={dark ? { background: D.bg } : {}}>
        {/* Top bar */}
        <header
          className={`px-6 py-3.5 flex items-center gap-4 shrink-0 border-b backdrop-blur-sm ${
            dark ? "" : "border-gray-200 bg-white/80"
          }`}
          style={dark ? { background: D.header + "cc", borderColor: D.border, boxShadow: "0 1px 4px 0 rgba(0,0,0,0.4)" } : { boxShadow: "0 1px 4px 0 rgba(0,0,0,0.06)" }}
        >
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-2xl">
              <svg className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? "" : "text-gray-400"}`} style={dark ? { color: D.textMuted } : {}} xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search articles, topics, sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-lg border pl-9 pr-4 py-2 text-sm outline-none transition-all ${
                  dark ? "" : "border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 focus:bg-white"
                }`}
                style={dark ? { background: D.input, borderColor: D.border, color: D.text } : {}}
              />
            </div>
          </div>

          {/* Dark mode toggle button */}
          <button
            onClick={() => setDark(!dark)}
            className={`shrink-0 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              dark ? "" : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
            style={dark ? { background: D.hover, borderColor: D.border, color: "#facc15" } : {}}
            aria-label="Toggle dark mode"
          >
            {dark ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

        {/* Scrollable content */}
        <section className="flex-1 overflow-y-auto p-6">
          {/* Section heading */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className={`text-lg font-semibold tracking-tight ${dark ? "" : "text-gray-900"}`} style={dark ? { color: D.text } : {}}>
                {activeCategory === "Home" ? "Latest Stories" : activeCategory}
              </h1>
              <p className={`text-xs mt-0.5 ${dark ? "" : "text-gray-400"}`} style={dark ? { color: D.textMuted } : {}}>Stay informed. Detect bias.</p>
            </div>
            <span className={`text-[10px] font-medium uppercase tracking-wider ${dark ? "" : "text-gray-400"}`} style={dark ? { color: D.textMuted } : {}}>{articles.length} articles</span>
          </div>

          {/* Featured card */}
          <div
            className={`mb-5 rounded-2xl border overflow-hidden transition-all cursor-pointer group ${
              dark ? "" : "border-blue-100 bg-white"
            }`}
            style={dark
              ? { background: D.surface, borderColor: D.border, boxShadow: "0 2px 12px 0 rgba(0,0,0,0.6)" }
              : { boxShadow: "0 2px 12px 0 rgba(59,130,246,0.08), 0 1px 3px 0 rgba(0,0,0,0.06)" }
            }
          >
            <div
              className={`h-52 relative flex flex-col justify-end p-5 ${dark ? "" : "bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white"}`}
              style={dark ? { background: `linear-gradient(135deg, #0f0f1a, #111111)` } : {}}
            >
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `radial-gradient(circle, ${dark ? "#ffffff" : "#3b82f6"} 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
              <div
                className={`absolute top-4 right-4 flex items-center gap-1.5 backdrop-blur-sm rounded-full px-3 py-1 border ${dark ? "" : "bg-white/80 border-blue-100"}`}
                style={dark ? { background: "rgba(17,17,17,0.8)", borderColor: D.border } : {}}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className={`text-[10px] font-medium uppercase tracking-wider ${dark ? "" : "text-gray-500"}`} style={dark ? { color: D.textMuted } : {}}>Featured</span>
              </div>
              <div className="relative">
                <div className="h-2.5 w-24 rounded mb-2" style={{ background: dark ? D.skeleton : "#e5e7eb" }} />
                <div className="h-4 w-64 rounded mb-1.5" style={{ background: dark ? D.skeletonSoft : "#e5e7eb" }} />
                <div className="h-3 w-48 rounded" style={{ background: dark ? "#161616" : "#e5e7eb" }} />
              </div>
            </div>
            <div className={`px-5 py-3.5 flex items-center justify-between border-t ${dark ? "" : "border-gray-100"}`} style={dark ? { borderColor: D.border } : {}}>
              <div className="flex items-center gap-3">
                <div className="h-2 w-16 rounded" style={{ background: dark ? D.skeleton : "#f3f4f6" }} />
                <div className="h-2 w-10 rounded" style={{ background: dark ? D.skeleton : "#f3f4f6" }} />
              </div>
              <div className={`flex items-center gap-1.5 text-xs transition-colors ${dark ? "" : "text-gray-400 group-hover:text-blue-600"}`} style={dark ? { color: D.textMuted } : {}}>
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
                className={`rounded-xl border overflow-hidden transition-all hover:-translate-y-0.5 cursor-pointer group ${
                  dark ? "" : `${lightCardBorders[i % lightCardBorders.length]} bg-white`
                }`}
                style={dark
                  ? { background: D.surface, borderColor: D.border, boxShadow: "0 1px 4px 0 rgba(0,0,0,0.5)" }
                  : { boxShadow: "0 1px 4px 0 rgba(0,0,0,0.05)" }
                }
              >
                <div className={`h-28 bg-gradient-to-br ${cardAccents[i % cardAccents.length]} relative`}>
                  <div className="absolute inset-0 opacity-[0.5]" style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
                </div>
                <div className="p-3.5">
                  <div className="h-2 w-14 rounded mb-2" style={{ background: dark ? D.skeleton : "#f3f4f6" }} />
                  <div className="h-2.5 w-full rounded mb-1.5" style={{ background: dark ? D.skeleton : "#f3f4f6" }} />
                  <div className="h-2.5 w-4/5 rounded" style={{ background: dark ? D.skeletonSoft : "#f3f4f680" }} />
                  <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: dark ? D.border : "#f3f4f6" }}>
                    <div className="h-1.5 w-10 rounded" style={{ background: dark ? D.skeleton : "#f3f4f6" }} />
                    <div className="h-1.5 w-8 rounded" style={{ background: dark ? D.skeleton : "#f3f4f6" }} />
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
