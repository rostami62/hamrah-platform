"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/auth/actions";
import type { CaseStatus, CaseUrgency } from "@/types/database";

const CASE_STATUSES: CaseStatus[] = ["open", "under_review", "completed"];
const URGENCIES: CaseUrgency[] = ["low", "medium", "high", "emergency"];

export async function updateCaseStatusAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const patientFileId = String(formData.get("patientFileId") ?? "");
  const caseStatus = String(formData.get("caseStatus") ?? "") as CaseStatus;
  const urgency = String(formData.get("urgency") ?? "") as CaseUrgency;

  if (!CASE_STATUSES.includes(caseStatus) || !URGENCIES.includes(urgency)) {
    return { error: "مقدار نامعتبر است." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("patient_files")
    .update({ case_status: caseStatus, urgency })
    .eq("id", patientFileId);

  if (error) return { error: "ذخیره ناموفق بود؛ دوباره تلاش کنید." };

  revalidatePath(`/dashboard/social-worker/cases/${patientFileId}`);
  revalidatePath("/dashboard/social-worker");
  return {};
}
