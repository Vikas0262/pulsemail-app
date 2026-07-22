"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { memo, useState } from "react";
import { logout } from "@/lib/auth";

const navItems = [
  { href: "/contacts", label: "Contacts", icon: "👥" },
  { href: "/audiences", label: "Audiences", icon: "🎯" },
  { href: "/campaigns", label: "Campaigns", icon: "📧" },
];

const SidebarNav = memo(function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: active ? "var(--sidebar-active)" : "transparent",
              color: active ? "white" : "var(--sidebar-muted)",
            }}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </>
  );
});

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen">
      {/* Mobile top bar */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 border-b"
        style={{ background: "var(--sidebar)", borderColor: "rgba(255,255,255,0.1)" }}
      >
        <div className="flex items-center gap-2 text-white">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: "var(--primary)" }}
          >
            P
          </div>
          <span className="font-bold">PulseMail</span>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="text-white p-2 rounded-lg"
          style={{ background: "var(--sidebar-active)" }}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </header>

      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar — fixed, stable across page navigations */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 flex flex-col text-white lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-200 ease-in-out lg:transition-none`}
        style={{ background: "var(--sidebar)" }}
      >
        <div className="px-6 py-6 border-b border-white/10 hidden lg:block shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ background: "var(--primary)" }}
            >
              P
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight">PulseMail</div>
              <div className="text-xs" style={{ color: "var(--sidebar-muted)" }}>
                Email Marketing
              </div>
            </div>
          </div>
        </div>

        <div className="h-14 lg:hidden shrink-0" />

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <SidebarNav pathname={pathname} onNavigate={() => setMenuOpen(false)} />
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full btn btn-secondary text-sm"
            style={{
              background: "transparent",
              color: "var(--sidebar-muted)",
              borderColor: "rgba(255,255,255,0.15)",
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

export default memo(AppShell);
