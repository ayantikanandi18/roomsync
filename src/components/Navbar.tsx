"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/discover", label: "Discover" },
  { href: "/matches", label: "Matches" },
  { href: "/profile", label: "Profile" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-border bg-card sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/discover" className="flex items-center gap-2 font-semibold text-lg">
          <span className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-white text-sm font-bold">
            R
          </span>
          Roomsync
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-muted hover:text-foreground hover:bg-black/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="ml-2 px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-black/5 transition-colors"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
