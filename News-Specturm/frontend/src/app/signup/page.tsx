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
          Create Account
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-lg border px-3 py-2 text-sm outline-none transition-all"
            style={{
              background: "var(--d-input)",
              borderColor: "var(--d-border)",
              color: "var(--d-text)",
            }}
          />
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
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white font-medium transition-colors hover:bg-blue-500 shadow-sm shadow-blue-200"
          >
            Sign Up
          </button>
        </form>
        {message && (
          <p className="mt-4 text-sm text-center" style={{ color: "var(--d-text-muted)" }}>
            {message}
          </p>
        )}
        <p className="mt-6 text-sm text-center" style={{ color: "var(--d-text-muted)" }}>
          Already have an account?{" "}
          <Link
            href="/"
            className="underline transition-colors"
            style={{ color: "var(--d-active-color)" }}
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
