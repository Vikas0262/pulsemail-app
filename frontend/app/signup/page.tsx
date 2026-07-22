"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function SignupPage() {

  const router = useRouter();

  const [accountName, setAccountName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    try {

      setLoading(true);

      const res = await api.signup({
        accountName,
        email,
        password,
      });

      saveToken(res.token);

      router.push("/contacts");

    } catch (err: unknown) {

      setError(err instanceof Error ? err.message : "Signup failed");

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
          Signup
        </h1>

        {error && (
          <p className="text-red-500 mb-4">
            {error}
          </p>
        )}

        <input
          placeholder="Account Name"
          className="border p-3 w-full rounded mb-4"
          value={accountName}
          onChange={(e)=>setAccountName(e.target.value)}
        />

        <input
          placeholder="Email"
          className="border p-3 w-full rounded mb-4"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-3 w-full rounded mb-6"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          className="bg-green-600 w-full text-white p-3 rounded"
        >
          {loading ? "Loading..." : "Signup"}
        </button>

        <p className="text-center mt-5">

          Already have account?

          <span
            className="text-blue-600 ml-2 cursor-pointer"
            onClick={()=>router.push("/login")}
          >
            Login
          </span>

        </p>

      </form>

    </div>

  );

}