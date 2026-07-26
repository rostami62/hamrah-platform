"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/auth/actions";
import type { CaseNoteRole } from "@/types/database";

const REVALIDATE_PATH_BY_ROLE: Record<CaseNoteRole, string> = {
  doctor: "/dashboard/doctor",
  psychologist: "/dashboard/psychologist",
  teacher: "/dashboard/teacher",
};

/**
 * ثبت/ویرایش یادداشت آزاد یک متخصص برای یک پرونده (upsert روی
 * unique(patient_file_id, role)). RLS تضمین می‌کند فقط متخصصِ اختصاص‌یافته
 * به همان نقش روی همان پرونده بتواند بنویسد.
 */
export async function saveCaseNoteAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const patientFileId = String(formData.get("patientFileId") ?? "");
  const role = String(formData.get("role") ?? "") as CaseNoteRole;
  const note = String(formData.get("note") ?? "").trim();

  if (!patientFileId || !["doctor", "psychologist", "teacher"].includes(role)) {
    return { error: "درخواست نامعتبر است." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "لطفاً دوباره وارد شوید." };

  const { error } = await supabase
    .from("case_notes")
    .upsert(
      { patient_file_id: patientFileId, role, author_id: user.id, note },
      { onConflict: "patient_file_id,role" }
    );

  if (error) return { error: "ذخیره گزارش ناموفق بود؛ دوباره تلاش کنید." };

  revalidatePath(REVALIDATE_PATH_BY_ROLE[role]);
  return {};
}
