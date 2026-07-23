"use server";

import { createClient } from "@/lib/supabase/server";
import type { QuestionnaireResult } from "@/types/mental-health";

/**
 * نتیجه را در پرونده‌ی الکترونیک ثبت می‌کند (فقط اگر کاربر جاری، والدِ
 * متصل به همان پرونده باشد — RLS این را تضمین می‌کند). خطا بی‌صدا نادیده
 * گرفته می‌شود چون ذخیره‌ی آفلاین در LocalStorage همیشه انجام شده است.
 */
export async function submitMentalHealthResultAction(
  patientFileId: string,
  result: QuestionnaireResult
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("mental_health_results").insert({
    patient_file_id: patientFileId,
    responses: result.responses,
    total_score: result.totalScore,
    max_score: result.maxScore,
    band: result.band,
  });
}
