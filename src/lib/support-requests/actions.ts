"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { markReferralCompleted } from "@/lib/patient-files/referrals-actions";
import type { ActionState } from "@/lib/auth/actions";

export async function createSupportRequestAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "لطفاً دوباره وارد شوید." };

  const patientFileId = String(formData.get("patientFileId") ?? "");
  const category = String(formData.get("category") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim() || null;
  const requiredAmountRaw = String(formData.get("requiredAmount") ?? "").trim();
  const requiredAmount = requiredAmountRaw ? Number(requiredAmountRaw) : null;

  if (!patientFileId || !category || !description) {
    return { error: "همه‌ی فیلدهای الزامی را تکمیل کنید." };
  }
  if (requiredAmountRaw && (Number.isNaN(requiredAmount) || (requiredAmount ?? 0) <= 0)) {
    return { error: "مبلغ موردنیاز باید عددی معتبر باشد." };
  }

  const { error } = await supabase.from("support_requests").insert({
    patient_file_id: patientFileId,
    category: category as "medical" | "educational" | "housing" | "other",
    description,
    city,
    required_amount: requiredAmount,
    created_by: user.id,
  });

  if (error) return { error: "ثبت درخواست ناموفق بود؛ دوباره تلاش کنید." };

  // ثبت اولین درخواست حمایت مالی برای این پرونده، ضلع «خیّرین» ارجاع را تکمیل‌شده علامت می‌زند
  await markReferralCompleted(patientFileId, "donor");

  revalidatePath("/dashboard/social-worker");
  return {};
}
