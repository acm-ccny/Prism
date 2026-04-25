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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black text-black dark:text-white">
      <div className="w-full max-w-sm rounded-lg bg-white dark:bg-zinc-900 p-8 shadow">
        <h1 className="mb-6 text-2xl font-semibold">Log In</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-black dark:bg-white px-4 py-2 text-white dark:text-black font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        {message && (
          <p className="mt-4 text-sm text-center text-zinc-600 dark:text-zinc-400">
            {message}
          </p>
        )}
        <p className="mt-6 text-sm text-center text-zinc-500">
          Need an account?{" "}
          <Link href="/signup" className="underline hover:text-black dark:hover:text-white">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
