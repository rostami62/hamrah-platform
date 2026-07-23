/** برای کاربران صفحه‌خوان/کیبورد: پرش مستقیم به محتوای اصلی، رد کردن ناوبری تکراری هدر. */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-50 focus:rounded-[var(--radius-control)] focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
    >
      پرش به محتوای اصلی
    </a>
  );
}
