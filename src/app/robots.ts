import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/", // پرونده‌ی کودکان و اطلاعات نقش‌محور
        "/admin/", // پنل مدیریت
        "/self-report/", // لینک‌های خوداظهاری حاوی توکن یک‌بارمصرف
        "/offline", // fallback داخلی PWA، بدون ارزش برای جستجو
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
