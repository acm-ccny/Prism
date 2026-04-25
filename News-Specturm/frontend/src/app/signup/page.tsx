"use client";
import { useState } from "react";
import { supabase } from "../../supabasefile";
import Link from "next/link";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Keep both keys for compatibility with common Supabase profile triggers.
        data: { name, full_name: name },
      },
    });

    if (error) {
      console.error("Supabase signUp error:", error);
      const rawMessage = error.message.toLowerCase();
      if (rawMessage.includes("email rate limit exceeded")) {
        setMessage(
          "Too many signup attempts in a short time. Please wait a few minutes or use a different email."
        );
      } else {
        setMessage(error.message);
      }
    } else {
      setMessage("Account created! Check your email to confirm.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black text-black dark:text-white">
      <div className="w-full max-w-sm rounded-lg bg-white dark:bg-zinc-900 p-8 shadow">
        <h1 className="mb-6 text-2xl font-semibold">Create Account</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
          />
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
            className="rounded bg-black dark:bg-white px-4 py-2 text-white dark:text-black font-medium transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            Sign Up
          </button>
        </form>
        {message && (
          <p className="mt-4 text-sm text-center text-zinc-600 dark:text-zinc-400">
            {message}
          </p>
        )}
        <p className="mt-6 text-sm text-center text-zinc-500">
          Already have an account?{" "}
          <Link href="/" className="underline hover:text-black dark:hover:text-white">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
