"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { markReferralCompleted } from "@/lib/patient-files/referrals-actions";
import type { ActionState } from "@/lib/auth/actions";

export async function savePsychologyReportAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const patientFileId = String(formData.get("patientFileId") ?? "");
  const behavioralAssessment = String(formData.get("behavioralAssessment") ?? "").trim() || null;
  const therapySessionNotes = String(formData.get("therapySessionNotes") ?? "").trim() || null;
  const mentalStatus = String(formData.get("mentalStatus") ?? "").trim() || null;

  if (!patientFileId) return { error: "درخواست نامعتبر است." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "لطفاً دوباره وارد شوید." };

  const { error } = await supabase.from("psychology_reports").upsert(
    {
      patient_file_id: patientFileId,
      author_id: user.id,
      behavioral_assessment: behavioralAssessment,
      therapy_session_notes: therapySessionNotes,
      mental_status: mentalStatus,
    },
    { onConflict: "patient_file_id" }
  );

  if (error) return { error: "ذخیره گزارش ناموفق بود؛ دوباره تلاش کنید." };

  await markReferralCompleted(patientFileId, "psychologist");

  revalidatePath("/dashboard/psychologist");
  return {};
}
