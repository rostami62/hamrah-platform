"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service-client";
import type { ActionState } from "@/lib/auth/actions";
import type { ReferralRole } from "@/types/database";

const REFERRAL_ROLES: ReferralRole[] = ["doctor", "psychologist", "teacher", "donor"];

/**
 * ارجاع هم‌زمان به هرکدام از ضلع‌های تخصصی که در فرم چک‌باکس انتخاب شده‌اند.
 * فقط ثبت «نیاز به این تخصص» است؛ انتخاب فرد مشخص کار جداگانه‌ی
 * AssignSpecialistForm است.
 */
export async function createReferralsAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const patientFileId = String(formData.get("patientFileId") ?? "");
  const selectedRoles = formData.getAll("roles").map(String).filter((r): r is ReferralRole =>
    REFERRAL_ROLES.includes(r as ReferralRole)
  );

  if (!patientFileId || selectedRoles.length === 0) {
    return { error: "حداقل یک بخش تخصصی را انتخاب کنید." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "لطفاً دوباره وارد شوید." };

  const { error } = await supabase.from("referrals").upsert(
    selectedRoles.map((role) => ({
      case_id: patientFileId,
      referred_to_role: role,
      created_by: user.id,
    })),
    { onConflict: "case_id,referred_to_role", ignoreDuplicates: true }
  );

  if (error) return { error: "ثبت ارجاع ناموفق بود؛ دوباره تلاش کنید." };

  revalidatePath("/dashboard/social-worker");
  return {};
}

/**
 * وقتی متخصص گزارش خودش را ثبت می‌کند، ارجاع مربوطه (اگر وجود داشته
 * باشد) را completed علامت می‌زند تا در داشبورد مددکار Badge سبز بگیرد.
 * نبودِ ردیف ارجاع خطا نیست (مثلاً وقتی مددکار مستقیم ارجاع داده بدون
 * عبور از فرم چک‌باکس).
 *
 * از service client استفاده می‌شود: این تابع فقط از داخل Server Actionهایی
 * صدا زده می‌شود که پیش از آن، نوشتنِ گزارش خودِ متخصص را با موفقیت از فیلتر
 * RLS جدول مربوطه (medical_reports/psychology_reports/academic_reports/
 * support_requests) عبور داده‌اند؛ یعنی مجوز واقعی همان‌جا احراز شده و این
 * فقط یک به‌روزرسانیِ دفترداریِ مشتق‌شده است، نه یک مسیر ورودی جدا.
 */
export async function markReferralCompleted(caseId: string, role: ReferralRole): Promise<void> {
  const service = createServiceClient();
  await service
    .from("referrals")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("case_id", caseId)
    .eq("referred_to_role", role);
}
