import type { QuestionnaireItem } from "@/types/mental-health";

/**
 * چک-این عمومی هفتگی سلامت روان — یک ابزار غربالگری اولیه و غیرتشخیصی
 * برای گفتگوی بهتر والدین با تیم درمانی، نه جایگزین ابزارهای بالینی
 * معتبر (مثل SDQ). گزینه‌ها: هرگز=۰، به‌ندرت=۱، گاهی=۲، اغلب=۳.
 */
export const MENTAL_HEALTH_QUESTIONS: QuestionnaireItem[] = [
  { id: "mood", prompt: "کودک غمگین یا بی‌حوصله به‌نظر می‌رسد" },
  { id: "sleep", prompt: "در به‌خواب‌رفتن یا خواب راحت مشکل دارد" },
  { id: "appetite", prompt: "تمایل به غذا خوردن کاهش یافته است" },
  { id: "withdrawal", prompt: "از بازی یا ارتباط با اطرافیان کناره‌گیری می‌کند" },
  { id: "worry", prompt: "نگرانی یا ترس بیش‌ازحد نشان می‌دهد" },
  { id: "irritability", prompt: "زودرنج یا زودعصبانی شده است" },
  { id: "energy", prompt: "بی‌انرژی یا بی‌رمق به‌نظر می‌رسد" },
];

export const LIKERT_LABELS: Record<0 | 1 | 2 | 3, string> = {
  0: "هرگز",
  1: "به‌ندرت",
  2: "گاهی",
  3: "اغلب",
};
