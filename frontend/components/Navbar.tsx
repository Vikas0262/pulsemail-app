"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <nav className="bg-blue-600 text-white px-8 py-4 flex justify-between items-center">

      <h1 className="text-xl font-bold">
        PulseMail
      </h1>

      <div className="flex gap-6">

        <Link href="/contacts">Contacts</Link>

        <Link href="/audiences">Audiences</Link>

        <Link href="/campaigns">Campaigns</Link>

      </div>

      <button
        onClick={handleLogout}
        className="bg-red-500 px-4 py-2 rounded"
      >
        Logout
      </button>

    </nav>
  );
}