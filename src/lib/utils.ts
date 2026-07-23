import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** ترکیب و رفع تداخل کلاس‌های Tailwind. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
