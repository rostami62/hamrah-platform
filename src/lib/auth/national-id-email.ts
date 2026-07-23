/**
 * Supabase Auth به یک شناسه‌ی ایمیل‌مانند نیاز دارد؛ چون ورود سامانه با
 * «کد ملی و رمز عبور» است، کد ملی را به یک ایمیل داخلی نگاشت می‌کنیم.
 * دامنه‌ی nid.hamrah.internal واقعی/قابل‌دسترس نیست و صرفاً یک شناسه‌ی
 * داخلی برای Supabase Auth است؛ کاربر هرگز آن را نمی‌بیند یا وارد نمی‌کند.
 */
export function nationalIdToAuthEmail(nationalId: string): string {
  return `${nationalId}@nid.hamrah.internal`;
}
