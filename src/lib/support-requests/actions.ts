"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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

  if (!patientFileId || !category || !description) {
    return { error: "همه‌ی فیلدهای الزامی را تکمیل کنید." };
  }

  const { error } = await supabase.from("support_requests").insert({
    patient_file_id: patientFileId,
    category: category as "medical" | "educational" | "housing" | "other",
    description,
    city,
    created_by: user.id,
  });

  if (error) return { error: "ثبت درخواست ناموفق بود؛ دوباره تلاش کنید." };

  revalidatePath("/dashboard/social-worker");
  return {};
}
