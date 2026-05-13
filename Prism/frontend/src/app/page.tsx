"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../supabasefile";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) router.replace("/home");
    };
    void checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }
    router.push("/home");
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: "var(--d-bg)", color: "var(--d-text)" }}
    >
      <div
        className="w-full max-w-sm rounded-xl border p-8"
        style={{
          background: "var(--d-surface)",
          borderColor: "var(--d-border)",
          boxShadow: "var(--d-card-shadow)",
        }}
      >
        <h1 className="mb-6 text-2xl font-semibold" style={{ color: "var(--d-text)" }}>
          Log In
        </h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg border px-3 py-2 text-sm outline-none transition-all"
            style={{
              background: "var(--d-input)",
              borderColor: "var(--d-border)",
              color: "var(--d-text)",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="rounded-lg border px-3 py-2 text-sm outline-none transition-all"
            style={{
              background: "var(--d-input)",
              borderColor: "var(--d-border)",
              color: "var(--d-text)",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white font-medium transition-colors hover:bg-blue-500 disabled:opacity-60 shadow-sm shadow-blue-200"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        {message && (
          <p className="mt-4 text-sm text-center" style={{ color: "var(--d-text-muted)" }}>
            {message}
          </p>
        )}
        <p className="mt-6 text-sm text-center" style={{ color: "var(--d-text-muted)" }}>
          Need an account?{" "}
          <Link
            href="/signup"
            className="underline transition-colors"
            style={{ color: "var(--d-active-color)" }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
