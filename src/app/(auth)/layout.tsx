import Link from "next/link";
import { SkipToContent } from "@/components/layout/skip-to-content";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-12">
      <SkipToContent />
      <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary-900">
        <span
          aria-hidden="true"
          className="grid h-8 w-8 place-items-center rounded-full bg-primary-600 text-sm font-bold text-white"
        >
          هـ
        </span>
        همراه
      </Link>
      <div id="main-content" className="w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
