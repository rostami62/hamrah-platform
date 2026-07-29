"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { markReferralCompleted } from "@/lib/patient-files/referrals-actions";
import type { ActionState } from "@/lib/auth/actions";

export async function saveAcademicReportAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const patientFileId = String(formData.get("patientFileId") ?? "");
  const academicPerformance = String(formData.get("academicPerformance") ?? "").trim() || null;
  const schoolBehavior = String(formData.get("schoolBehavior") ?? "").trim() || null;
  const attendanceStatus = String(formData.get("attendanceStatus") ?? "").trim() || null;
  const educationalNeeds = String(formData.get("educationalNeeds") ?? "").trim() || null;

  if (!patientFileId) return { error: "درخواست نامعتبر است." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "لطفاً دوباره وارد شوید." };

  const { error } = await supabase.from("academic_reports").upsert(
    {
      patient_file_id: patientFileId,
      author_id: user.id,
      academic_performance: academicPerformance,
      school_behavior: schoolBehavior,
      attendance_status: attendanceStatus,
      educational_needs: educationalNeeds,
    },
    { onConflict: "patient_file_id" }
  );

  if (error) return { error: "ذخیره گزارش ناموفق بود؛ دوباره تلاش کنید." };

  await markReferralCompleted(patientFileId, "teacher");

  revalidatePath("/dashboard/teacher");
  return {};
}
