// Service Worker پایه «همراه» — کش محتوای آگاهی‌بخشی برای دسترسی آفلاین والدین.
// نسخه را در هر تغییر ساختار کش بالا ببرید تا کش قدیمی باطل شود.
const CACHE_VERSION = "hamrah-v1";
const OFFLINE_URL = "/offline";
const APP_SHELL = [OFFLINE_URL, "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // ناوبری بین صفحات: ابتدا شبکه، در نبود اتصال از کش یا صفحه آفلاین
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(
          async () =>
            (await caches.match(request)) ||
            (await caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // فایل‌های استاتیک: کش‌محور با به‌روزرسانی در پس‌زمینه
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
