import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="rounded-full bg-primary-100 px-4 py-1 text-sm font-medium text-primary-700">
        خطای ۴۰۴
      </span>
      <h1 className="text-2xl font-bold text-primary-900">صفحه پیدا نشد</h1>
      <p className="text-primary-700">
        آدرسی که دنبال آن بودید در سامانه وجود ندارد یا جابه‌جا شده است.
      </p>
      <Link
        href="/"
        className="rounded-[var(--radius-control)] bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
      >
        بازگشت به صفحه اصلی
      </Link>
    </main>
  );
}
