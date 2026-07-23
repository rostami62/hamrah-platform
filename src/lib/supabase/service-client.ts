import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * کلاینت ممتاز Supabase — با SERVICE ROLE KEY تمام RLS را دور می‌زند.
 *
 * فقط داخل Server Action هایی استفاده شود که پیش از فراخوانی، مجوز عملیات
 * را خودشان به‌صورت صریح بررسی کرده‌اند (مثل اعتبارسنجی توکن خوداظهاری یا
 * تایید نقش ادمین). هرگز در کامپوننت کلاینتی import نشود.
 */
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
