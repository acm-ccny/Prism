"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FetchNewsButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      await fetch(`${apiUrl}/api/articles/fetch-news?category=general`);
      router.refresh();
    } catch {
      // silently ignore — the refresh will show results or the same empty state
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
    >
      {loading ? "Loading news…" : "Load latest news"}
    </button>
  );
}
