"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="rounded-full bg-danger/10 px-4 py-1 text-sm font-medium text-danger">
        خطای غیرمنتظره
      </span>
      <h1 className="text-2xl font-bold text-primary-900">مشکلی پیش آمد</h1>
      <p className="text-primary-700">
        این خطا ثبت شد. لطفاً دوباره تلاش کنید؛ اگر مشکل ادامه داشت، با
        پشتیبانی تماس بگیرید.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-[var(--radius-control)] bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
      >
        تلاش دوباره
      </button>
    </main>
  );
}
