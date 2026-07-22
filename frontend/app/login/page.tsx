"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await api.login({
        email,
        password,
      });

      saveToken(res.token);

      router.push("/contacts");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-[420px]"
      >

        <h1 className="text-3xl font-bold mb-6">
          Login
        </h1>

        {error && (
          <p className="text-red-500 mb-4">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="border w-full p-3 rounded mb-4"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border w-full p-3 rounded mb-6"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          className="bg-blue-600 w-full text-white p-3 rounded"
        >
          {loading ? "Loading..." : "Login"}
        </button>

        <p className="mt-5 text-center">

          Don&apos;t have account?

          <span
            className="text-blue-600 cursor-pointer ml-2"
            onClick={() => router.push("/signup")}
          >
            Signup
          </span>

        </p>

      </form>

    </div>
  );
}