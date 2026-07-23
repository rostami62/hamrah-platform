"use client";

import { useEffect } from "react";

/** ثبت سرویس‌ورکر برای دسترسی آفلاین به محتوای آگاهی‌بخشی. */
export function ServiceWorkerProvider() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") {
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  }, []);

  return null;
}
