"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/roadmap", label: "نقشه راه" },
  { href: "/resources", label: "منابع حمایتی" },
  { href: "/mental-health-check", label: "غربالگری سلامت روان" },
] as const;

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="rounded-[var(--radius-control)] border border-line p-2 text-primary-800"
      >
        <span className="sr-only">باز و بسته کردن منو</span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 6h16M4 12h16M4 18h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <nav
        id="mobile-nav"
        className={cn(
          "absolute inset-x-0 top-full flex flex-col gap-1 border-b border-line bg-surface px-6 py-4 shadow-sm",
          open ? "flex" : "hidden"
        )}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className="rounded-[var(--radius-control)] px-3 py-2 text-primary-800 hover:bg-primary-50"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
