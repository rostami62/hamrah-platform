import type {
  Complication,
  DiseaseType,
  EducationLevel,
  Prognosis,
} from "@/types/roadmap";

export const EDUCATION_LEVEL_OPTIONS: Record<EducationLevel, string> = {
  preschool: "پیش‌دبستانی",
  elementary: "دبستان",
  "middle-school": "متوسطه اول",
  "high-school": "متوسطه دوم",
};

export const DISEASE_TYPE_OPTIONS: Record<DiseaseType, string> = {
  leukemia: "لوسمی",
  lymphoma: "لنفوم",
  "brain-tumor": "تومور مغزی",
  "solid-tumor": "تومور توپر (سایر اندام‌ها)",
  other: "سایر",
};

export const PROGNOSIS_OPTIONS: Record<Prognosis, string> = {
  favorable: "مطلوب",
  guarded: "نیازمند پایش دقیق",
  critical: "بحرانی",
};

export const COMPLICATION_OPTIONS: Record<Complication, string> = {
  "immune-suppression": "تضعیف سیستم ایمنی",
  "cognitive-effects": "اثرات شناختی (تمرکز، حافظه)",
  "mobility-limitation": "محدودیت حرکتی",
  fatigue: "خستگی مزمن",
  "body-image": "تغییر ظاهر و تصویر بدنی (مثل ریزش مو)",
  none: "بدون عارضه قابل‌توجه",
};
