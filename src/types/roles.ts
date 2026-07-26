/** نقش‌های دسترسی سامانه؛ مبنای Middleware احراز هویت و مسیر داشبوردها در فاز ۳. */
export const USER_ROLES = [
  "doctor",
  "psychologist",
  "social-worker",
  "parent",
  "teacher",
  "donor",
  "admin",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS_FA: Record<UserRole, string> = {
  doctor: "پزشک",
  psychologist: "روان‌شناس / مشاور",
  "social-worker": "مددکار اجتماعی",
  parent: "والدین",
  teacher: "معلم / آموزش‌یار",
  donor: "خیّر",
  admin: "مدیر سیستم",
};

/** مسیر پایه‌ی داشبورد هر نقش زیر app/dashboard/[role] در فاز ۳. */
export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  doctor: "/dashboard/doctor",
  psychologist: "/dashboard/psychologist",
  "social-worker": "/dashboard/social-worker",
  parent: "/dashboard/parent",
  teacher: "/dashboard/teacher",
  donor: "/dashboard/donor",
  admin: "/admin",
};

/** نقش‌هایی که می‌توانند برای ارجاع مستقیم پرونده انتخاب شوند. */
export const REFERRABLE_SPECIALIST_ROLES = ["doctor", "psychologist", "teacher"] as const;
export type ReferrableSpecialistRole = (typeof REFERRABLE_SPECIALIST_ROLES)[number];
