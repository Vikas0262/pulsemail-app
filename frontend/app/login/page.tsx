"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { saveToken } from "@/lib/auth";
import { validateEmail, validatePassword } from "@/lib/validation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password, 1);
    if (emailError || passwordError) {
      setError(emailError || passwordError || "Invalid input");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await api.login({ email, password });
      saveToken(res.token);
      router.push("/contacts");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 items-center justify-center p-12" style={{ background: "var(--sidebar)" }}>
        <div className="max-w-md text-white">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6" style={{ background: "var(--primary)" }}>P</div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">PulseMail</h1>
          <p className="text-lg" style={{ color: "var(--sidebar-muted)" }}>
            Import contacts, build audiences, and send tracked email campaigns — all in one workspace.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="card p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Sign in to your workspace</p>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="space-y-4">
            <input type="email" placeholder="Email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={1} />
            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </div>

          <p className="mt-6 text-center text-sm" style={{ color: "var(--muted)" }}>
            No account? <Link href="/signup" style={{ color: "var(--primary)" }} className="font-semibold">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
