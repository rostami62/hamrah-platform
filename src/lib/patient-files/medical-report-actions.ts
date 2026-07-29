"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { markReferralCompleted } from "@/lib/patient-files/referrals-actions";
import type { ActionState } from "@/lib/auth/actions";

export async function saveMedicalReportAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const patientFileId = String(formData.get("patientFileId") ?? "");
  const diagnosis = String(formData.get("diagnosis") ?? "").trim() || null;
  const medications = String(formData.get("medications") ?? "").trim() || null;
  const treatmentPlan = String(formData.get("treatmentPlan") ?? "").trim() || null;
  const nextVisitDate = String(formData.get("nextVisitDate") ?? "").trim() || null;

  if (!patientFileId) return { error: "درخواست نامعتبر است." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "لطفاً دوباره وارد شوید." };

  const { error } = await supabase.from("medical_reports").upsert(
    {
      patient_file_id: patientFileId,
      author_id: user.id,
      diagnosis,
      medications,
      treatment_plan: treatmentPlan,
      next_visit_date: nextVisitDate,
    },
    { onConflict: "patient_file_id" }
  );

  if (error) return { error: "ذخیره گزارش ناموفق بود؛ دوباره تلاش کنید." };

  await markReferralCompleted(patientFileId, "doctor");

  revalidatePath("/dashboard/doctor");
  return {};
}

export async function attachMedicalDocumentAction(
  patientFileId: string,
  filePath: string,
  fileName: string
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("medical_documents").insert({
    patient_file_id: patientFileId,
    uploaded_by: user.id,
    file_path: filePath,
    file_name: fileName,
  });

  revalidatePath("/dashboard/doctor");
}
