/**
 * لایه‌ی دسترسی به LocalStorage برای ذخیره‌ی محتوای آگاهی‌بخشی (نقشه‌راه،
 * منابع خیریه‌ها، مقالات آموزشی و ...) جهت مطالعه‌ی آفلاین توسط والدین.
 * تمام کلیدها با پیشوند مشترک ذخیره می‌شوند تا از تداخل با سایر داده‌ها
 * جلوگیری شود؛ SSR-safe (در نبود `window` بی‌اثر عمل می‌کند).
 */
const STORAGE_PREFIX = "hamrah:offline:";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function saveOfflineContent<T>(key: string, data: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save offline content for "${key}":`, error);
  }
}

export function loadOfflineContent<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (error) {
    console.error(`Failed to load offline content for "${key}":`, error);
    return null;
  }
}

export function removeOfflineContent(key: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_PREFIX + key);
}

export function listOfflineContentKeys(): string[] {
  if (!isBrowser()) return [];
  return Object.keys(window.localStorage)
    .filter((k) => k.startsWith(STORAGE_PREFIX))
    .map((k) => k.slice(STORAGE_PREFIX.length));
}
