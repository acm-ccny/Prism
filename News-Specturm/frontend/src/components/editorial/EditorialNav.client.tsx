"use client";
import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../supabasefile";

const CATEGORIES: { label: string; slug: string; href?: string }[] = [
  { label: "Top Stories", slug: "home" },
  { label: "Politics", slug: "politics" },
  { label: "Technology", slug: "technology" },
  { label: "Business", slug: "business" },
  { label: "Science", slug: "science" },
  { label: "Sports", slug: "sports" },
  { label: "Analyze URL", slug: "analyze", href: "/analyze" },
];

interface Props {
  activeCategory: string;
  initialSearch?: string;
}

const subscribeTheme = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};
const getThemeSnapshot = () => localStorage.getItem("theme") === "dark";
const getThemeServerSnapshot = () => false;

export default function EditorialNav({ activeCategory, initialSearch = "" }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [searchFocused, setSearchFocused] = useState(false);
  const isDark = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );
  const [avatarLetter, setAvatarLetter] = useState("G");
  const [menuOpen, setMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState("Guest");
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sync = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        setAvatarLetter("G");
        setDisplayName("Guest");
        return;
      }
      const name =
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined) ||
        user.email ||
        "User";
      setDisplayName(name);
      setAvatarLetter(name.charAt(0).toUpperCase() || "U");
    };
    void sync();
    const { data } = supabase.auth.onAuthStateChange(() => void sync());
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const toggleDark = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    window.dispatchEvent(new StorageEvent("storage", { key: "theme" }));
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "var(--ed-surface)",
        borderBottom: "1px solid var(--ed-hairline)",
        backdropFilter: "blur(8px)",
        fontFamily: "var(--font-inter), Inter, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "14px 28px",
          maxWidth: 1440,
          margin: "0 auto",
        }}
      >
        {/* Logo */}
        <Link
          href="/home"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background:
                "linear-gradient(135deg, var(--ed-bias-left-color), var(--ed-bias-center-color), var(--ed-bias-right-color))",
            }}
          />
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--ed-text-accent)",
            }}
          >
            Prism
          </span>
        </Link>

        {/* Category nav */}
        <nav
          className="ed-scroll-x"
          style={{
            display: "flex",
            gap: 2,
            flex: 1,
            marginLeft: 8,
            overflowX: "auto",
          }}
        >
          {CATEGORIES.map((c) => {
            const isActive = activeCategory === c.slug;
            const href = c.href ?? (c.slug === "home" ? "/home" : `/home?category=${c.slug}`);
            return (
              <Link
                key={c.slug}
                href={href}
                style={{
                  padding: "7px 12px",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--ed-text-accent)" : "var(--ed-text-dim)",
                  textDecoration: "none",
                  borderBottom: isActive
                    ? "2px solid var(--ed-text-accent)"
                    : "2px solid transparent",
                  marginBottom: -1,
                  whiteSpace: "nowrap",
                  transition: "color 0.15s",
                }}
              >
                {c.label}
              </Link>
            );
          })}
        </nav>

        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 12px",
            background: "var(--ed-chip-bg)",
            border: `1px solid ${searchFocused ? "var(--ed-text-dim)" : "var(--ed-hairline)"}`,
            borderRadius: 8,
            width: 280,
            color: "var(--ed-text-muted)",
            fontSize: 13,
            transition: "border-color 0.15s",
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search articles, sources…"
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              flex: 1,
              minWidth: 0,
              fontSize: 13,
              fontFamily: "inherit",
              color: "var(--ed-text-primary)",
            }}
          />
          <span
            style={{
              fontFamily:
                "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
              fontSize: 10,
              padding: "1px 5px",
              borderRadius: 3,
              background: "var(--ed-hairline)",
              border: "1px solid var(--ed-hairline)",
              color: "var(--ed-text-muted)",
              flexShrink: 0,
            }}
          >
            ⌘K
          </span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleDark}
          aria-label="Toggle dark mode"
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            background: "transparent",
            border: "1px solid var(--ed-hairline)",
            color: "var(--ed-text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {isDark ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Avatar / menu */}
        <div ref={menuRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              width: 30,
              height: 30,
              borderRadius: 999,
              background: "var(--ed-text-accent)",
              color: "var(--ed-surface)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            aria-label="Account menu"
          >
            {avatarLetter}
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                minWidth: 200,
                background: "var(--ed-surface)",
                border: "1px solid var(--ed-hairline)",
                borderRadius: 10,
                boxShadow: "0 8px 24px oklch(0 0 0 / 0.08)",
                padding: 6,
                zIndex: 40,
              }}
            >
              <div
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid var(--ed-hairline)",
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--ed-text-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {displayName}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--ed-text-muted)",
                    fontFamily:
                      "var(--font-plex), 'IBM Plex Mono', ui-monospace, monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginTop: 2,
                  }}
                >
                  Signed in
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  fontSize: 13,
                  background: "transparent",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  color: "var(--ed-text-primary)",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--ed-chip-bg)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
