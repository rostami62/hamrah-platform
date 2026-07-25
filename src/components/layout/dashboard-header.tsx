import Link from "next/link";
import { logoutAction } from "@/lib/auth/actions";
import { ROLE_LABELS_FA, type UserRole } from "@/types/roles";

export function DashboardHeader({
  fullName,
  role,
}: {
  fullName: string;
  role: UserRole;
}) {
  return (
    <header className="border-b border-line bg-surface">
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

        <div className="flex items-center gap-4">
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-primary-900">{fullName}</p>
            <p className="text-xs text-primary-600">{ROLE_LABELS_FA[role]}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-[var(--radius-control)] border border-line px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50"
            >
              خروج از حساب کاربری
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
