import { ImageResponse } from "next/og";

export const alt = "همراه — پلتفرم پشتیبانی کودکان مبتلا به سرطان";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// از فونت Latin پیش‌فرض استفاده می‌شود (بدون وابستگی شبکه‌ای به فونت فارسی)؛
// نشان برند به‌صورت SVG رسم می‌شود تا مستقل از پشتیبانی گلیف باشد.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "linear-gradient(135deg, #184341 0%, #1c7d76 55%, #269c92 100%)",
        }}
      >
        <svg width="96" height="96" viewBox="0 0 64 64">
          <rect width="64" height="64" rx="16" fill="#ffffff" />
          <path
            d="M32 46c-8.5-5.7-15-11.4-15-19.2C17 20.6 21.7 16 27.4 16c3 0 5.9 1.4 7.6 3.7 1.7-2.3 4.6-3.7 7.6-3.7C48.3 16 53 20.6 53 26.8 53 34.6 46.5 40.3 38 46l-3 2-3-2z"
            fill="#1c7d76"
          />
        </svg>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700, color: "#ffffff" }}>
          Hamrah
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#d4f4f1" }}>
          Supporting children with cancer &amp; their families
        </div>
      </div>
    ),
    { ...size }
  );
}
