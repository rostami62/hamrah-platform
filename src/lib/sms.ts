import "server-only";

export interface SmsProvider {
  send(phone: string, message: string): Promise<void>;
}

/**
 * پیاده‌سازی توسعه: به‌جای ارسال واقعی، پیام را در کنسول سرور لاگ می‌کند.
 * برای اتصال یک درگاه واقعی (کاوه‌نگار/قاصدک/ملی‌پیامک)، این کلاس را با
 * پیاده‌سازی HTTP همان سرویس جایگزین و SMS_PROVIDER را در .env تنظیم کنید.
 */
class ConsoleSmsProvider implements SmsProvider {
  async send(phone: string, message: string): Promise<void> {
    console.log(`[SMS → ${phone}] ${message}`);
  }
}

export function getSmsProvider(): SmsProvider {
  return new ConsoleSmsProvider();
}

export async function sendSelfReportSms(phone: string, link: string, role: "doctor" | "parent") {
  const audience = role === "doctor" ? "پزشک" : "والد";
  const message = `همراه: لطفاً فرم خوداظهاری ${audience} را از این لینک تکمیل کنید: ${link}`;
  await getSmsProvider().send(phone, message);
}
