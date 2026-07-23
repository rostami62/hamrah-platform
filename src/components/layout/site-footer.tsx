export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface-2">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-primary-700">
        <p>
          «همراه» یک سامانه‌ی پشتیبانی است و جایگزین تشخیص یا درمان پزشکی
          نیست. برای هر تصمیم درمانی حتماً با تیم درمانی کودک مشورت کنید.
        </p>
        <p className="mt-2 text-primary-900/60">
          © {new Date().getFullYear()} همراه
        </p>
      </div>
    </footer>
  );
}
