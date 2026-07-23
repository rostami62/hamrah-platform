import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * کاربر و پروفایل نشست فعلی را برمی‌گرداند؛ در نبود نشست یا در دسترس‌نبودن
 * Supabase (مثلاً هنگام توسعه بدون تنظیمات واقعی)، null برمی‌گرداند تا
 * صفحات عمومی همچنان قابل نمایش بمانند.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return profile ?? null;
  } catch (error) {
    console.error("getCurrentProfile failed:", error);
    return null;
  }
}
