import "server-only";
import type { User } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/service-client";
import type { UserRole } from "@/types/roles";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * ردیف profiles کاربر را برمی‌گرداند؛ اگر به هر دلیل (مثلاً خطای گذرای
 * تریگر handle_new_user در دیتابیس) وجود نداشته باشد، از روی متادیتای
 * auth.users بازسازی می‌کند. بدون این، کاربرِ احرازهویت‌شده بدون profile
 * توسط middleware به‌اشتباه به /login برگردانده می‌شود (به نظر می‌رسد
 * «ورود کار نمی‌کند» درحالی‌که Auth موفق بوده است).
 */
export async function ensureProfile(user: User): Promise<Profile | null> {
  const service = createServiceClient();

  const { data: existing } = await service
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (existing) return existing;

  const role = user.user_metadata?.role as UserRole | undefined;
  const nationalId = user.user_metadata?.national_id as string | undefined;
  const fullName = user.user_metadata?.full_name as string | undefined;
  if (!role || !nationalId || !fullName) return null;

  const { data: created } = await service
    .from("profiles")
    .insert({
      id: user.id,
      role,
      national_id: nationalId,
      full_name: fullName,
      verified: role !== "doctor",
    })
    .select("*")
    .single();

  return created ?? null;
}
