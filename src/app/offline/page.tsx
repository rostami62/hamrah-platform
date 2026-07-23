import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "آفلاین",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-2xl font-bold text-primary-900">
        اتصال اینترنت برقرار نیست
      </h1>
      <p className="text-primary-700">
        این صفحه در دسترس نیست، اما محتوای آگاهی‌بخشی که پیش‌تر باز کرده‌اید
        همچنان به‌صورت آفلاین قابل مشاهده است.
      </p>
    </main>
  );
}
