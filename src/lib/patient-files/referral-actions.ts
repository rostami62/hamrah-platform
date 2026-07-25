"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service-client";
import type { ActionState } from "@/lib/auth/actions";

/**
 * ارجاع مستقیم پرونده به یک متخصص تاییدشده (بدون نیاز به لینک خوداظهاری
 * پیامکی) — doctor_id/teacher_id همان ستون‌هایی هستند که داشبورد پزشک/
 * معلم برای فیلتر «پرونده‌های متصل به من» استفاده می‌کند.
 */
export async function assignSpecialistAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const patientFileId = String(formData.get("patientFileId") ?? "");
  const specialistRole = String(formData.get("specialistRole") ?? "");
  const profileId = String(formData.get("profileId") ?? "");

  if (!patientFileId || !profileId) {
    return { error: "یک متخصص را انتخاب کنید." };
  }
  if (specialistRole !== "doctor" && specialistRole !== "teacher") {
    return { error: "نقش نامعتبر است." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "لطفاً دوباره وارد شوید." };

  const update = specialistRole === "doctor" ? { doctor_id: profileId } : { teacher_id: profileId };

  const { error } = await supabase
    .from("patient_files")
    .update(update)
    .eq("id", patientFileId)
    .eq("created_by", user.id);

  if (error) return { error: "ارجاع ناموفق بود؛ دوباره تلاش کنید." };

  const service = createServiceClient();
  await service.from("audit_logs").insert({
    actor_id: user.id,
    action: specialistRole === "doctor" ? "doctor_assigned" : "teacher_assigned",
    target_table: "patient_files",
    target_id: patientFileId,
  });

  revalidatePath("/dashboard/social-worker");
  return {};
}
