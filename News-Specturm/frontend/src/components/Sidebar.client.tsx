"use client";
import { useState } from "react";
import { useEffect } from "react";
import Link from "next/link";
import { supabase } from "../supabasefile";

const categories = [
  {
    name: "Home",
    slug: "home",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1",
  },
  {
    name: "Politics",
    slug: "politics",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5",
  },
  {
    name: "Technology",
    slug: "technology",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    name: "Sports",
    slug: "sports",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    name: "Science",
    slug: "science",
    icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
  },
  {
    name: "Business",
    slug: "business",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

interface Props {
  activeCategory: string; // slug
}

export default function SidebarClient({ activeCategory }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [displayName, setDisplayName] = useState("Guest User");
  const [statusLabel, setStatusLabel] = useState("Not signed in");

  useEffect(() => {
    const syncUserState = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        setDisplayName("Guest User");
        setStatusLabel("Not signed in");
        return;
      }

      const nameFromMeta =
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined);
      setDisplayName(nameFromMeta || user.email || "User");
      setStatusLabel("Signed in");
    };

    void syncUserState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncUserState();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <aside
      className={`${
        sidebarOpen ? "w-56" : "w-12"
      } shrink-0 border-r flex flex-col transition-all duration-300`}
      style={{
        background: "var(--d-surface)",
        borderColor: "var(--d-border)",
        boxShadow: "var(--d-sidebar-shadow)",
      }}
    >
      {/* Logo + hamburger toggle */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        {sidebarOpen && (
          <div className="flex items-center gap-2 pl-1">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span
              className="text-sm font-semibold tracking-tight"
              style={{ color: "var(--d-text)" }}
            >
              BiasDetect
            </span>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md transition-colors ml-auto"
          style={{ color: "var(--d-text-muted)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "var(--d-hover)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "transparent";
          }}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Category nav */}
      <div
        className={`${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        } transition-opacity duration-300 px-3 pt-3 pb-4`}
      >
        <nav className="flex flex-col gap-0.5">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            const href =
              cat.slug === "home" ? "/home" : `/home?category=${cat.slug}`;
            return (
              <Link
                key={cat.name}
                href={href}
                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm whitespace-nowrap transition-colors"
                style={{
                  background: isActive ? "var(--d-hover)" : "transparent",
                  color: isActive ? "var(--d-text)" : "var(--d-text-muted)",
                  fontWeight: isActive ? 600 : 400,
                  textDecoration: "none",
                }}
                onMouseEnter={
                  !isActive
                    ? (e) => {
                        const el = e.currentTarget as HTMLAnchorElement;
                        el.style.background = "var(--d-hover)";
                        el.style.color = "var(--d-text)";
                      }
                    : undefined
                }
                onMouseLeave={
                  !isActive
                    ? (e) => {
                        const el = e.currentTarget as HTMLAnchorElement;
                        el.style.background = "transparent";
                        el.style.color = "var(--d-text-muted)";
                      }
                    : undefined
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: isActive ? 1 : 0.6 }}
                >
                  <path d={cat.icon} />
                </svg>
                {cat.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom guest section */}
      <div
        className={`${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        } transition-opacity duration-300 mt-auto border-t p-3`}
        style={{ borderColor: "var(--d-border)" }}
      >
        <div
          className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors cursor-pointer"
          style={{ color: "var(--d-text-muted)" }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
            style={{ background: "#2a2a2a", color: "#888" }}
          >
            G
          </div>
          <div className="min-w-0">
            <p
              className="text-xs whitespace-nowrap font-medium"
              style={{ color: "var(--d-text)" }}
            >
              {displayName}
            </p>
            <p
              className="text-[10px] whitespace-nowrap"
              style={{ color: "var(--d-text-muted)" }}
            >
              {statusLabel}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
