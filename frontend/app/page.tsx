"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace("/contacts");
    } else {
      router.replace("/login");
    }
  }, []);

  return (
    <div className="h-screen flex items-center justify-center">
      Loading...
    </div>
  );
}