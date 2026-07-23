import Link from "next/link";
import { MobileMenu } from "./mobile-menu";
import { getCurrentProfile } from "@/lib/auth/session";
import { ROLE_DASHBOARD_PATH } from "@/types/roles";
import { logoutAction } from "@/lib/auth/actions";

const NAV_LINKS = [
  { href: "/roadmap", label: "نقشه راه" },
  { href: "/resources", label: "منابع حمایتی" },
  { href: "/mental-health-check", label: "غربالگری سلامت روان" },
] as const;

export async function SiteHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="relative border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-primary-900"
        >
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-full bg-primary-600 text-sm font-bold text-white"
          >
            هـ
          </span>
          همراه
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium text-primary-800 hover:bg-primary-50"
            >
              {link.label}
            </Link>
          ))}

          {profile ? (
            <>
              <Link
                href={ROLE_DASHBOARD_PATH[profile.role]}
                className="rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium text-primary-800 hover:bg-primary-50"
              >
                داشبورد من
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
                >
                  خروج
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-[var(--radius-control)] bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              ورود
            </Link>
          )}
        </nav>

        <MobileMenu />
      </div>
    </header>
  );
}
