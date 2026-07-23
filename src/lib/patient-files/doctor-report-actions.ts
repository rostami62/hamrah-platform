"use server";

import { createClient } from "@/lib/supabase/server";
import { validateSelfReportToken, type SelfReportState } from "./self-report-token";

export type { SelfReportState };

export async function submitDoctorReportAction(
  _prevState: SelfReportState,
  formData: FormData
): Promise<SelfReportState> {
  const token = String(formData.get("token") ?? "");
  const validated = await validateSelfReportToken(token, "doctor");
  if ("error" in validated) return { error: validated.error };
  const { service, tokenRow } = validated;

  const diseaseType = String(formData.get("diseaseType") ?? "");
  const prognosis = String(formData.get("prognosis") ?? "");
  const treatmentDuration = String(formData.get("treatmentDuration") ?? "");
  const complications = formData.getAll("complications").map(String);
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!diseaseType || !prognosis || !treatmentDuration) {
    return { error: "همه‌ی فیلدهای الزامی را تکمیل کنید." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error: insertError } = await service.from("doctor_reports").insert({
    patient_file_id: tokenRow.patient_file_id,
    disease_type: diseaseType,
    prognosis,
    treatment_duration: treatmentDuration as "under-6-months" | "6-to-12-months" | "over-12-months",
    complications,
    notes,
    submitted_by: user?.id ?? null,
  });
  if (insertError) return { error: "ثبت گزارش ناموفق بود؛ دوباره تلاش کنید." };

  await service.from("self_report_tokens").update({ used: true }).eq("token", token);

  const { data: parentReport } = await service
    .from("parent_reports")
    .select("id")
    .eq("patient_file_id", tokenRow.patient_file_id)
    .maybeSingle();

  const status = parentReport ? "active" : "awaiting_parent";
  await service
    .from("patient_files")
    .update(user?.id ? { status, doctor_id: user.id } : { status })
    .eq("id", tokenRow.patient_file_id);

  await service.from("audit_logs").insert({
    actor_id: user?.id ?? null,
    action: "doctor_report_submitted",
    target_table: "patient_files",
    target_id: tokenRow.patient_file_id,
  });

  return { success: true };
}
