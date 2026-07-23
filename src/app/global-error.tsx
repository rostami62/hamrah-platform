"use client";

// این فایل جایگزین کل layout.tsx می‌شود، پس عمداً به globals.css یا فونت
// سفارشی وابسته نیست — آخرین خط دفاعی در برابر خطاهای خودِ layout ریشه است.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          background: "#f7f9f8",
          color: "#184341",
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>مشکلی در سامانه پیش آمد</h1>
        <p>لطفاً صفحه را دوباره بارگذاری کنید.</p>
        <button
          type="button"
          onClick={reset}
          style={{
            borderRadius: 10,
            background: "#1c7d76",
            color: "#fff",
            padding: "10px 20px",
            border: "none",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          تلاش دوباره
        </button>
      </body>
    </html>
  );
}
