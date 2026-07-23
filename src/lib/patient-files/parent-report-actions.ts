"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { nationalIdToAuthEmail } from "@/lib/auth/national-id-email";
import { validateNationalId } from "@/lib/validation/national-id";
import { validateSelfReportToken, type SelfReportState } from "./self-report-token";

export type { SelfReportState };

export async function submitParentReportAction(
  _prevState: SelfReportState,
  formData: FormData
): Promise<SelfReportState> {
  const token = String(formData.get("token") ?? "");
  const validated = await validateSelfReportToken(token, "parent");
  if ("error" in validated) return { error: validated.error };
  const { service, tokenRow } = validated;

  const parentNationalId = String(formData.get("parentNationalId") ?? "").trim();
  const parentFullName = String(formData.get("parentFullName") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const educationLevel = String(formData.get("educationLevel") ?? "");
  const parentJob = String(formData.get("parentJob") ?? "").trim();
  const householdIncomeBracket = String(formData.get("householdIncomeBracket") ?? "");
  const schoolName = String(formData.get("schoolName") ?? "").trim();

  if (!validateNationalId(parentNationalId)) return { error: "کد ملی وارد شده معتبر نیست." };
  if (password.length < 8) return { error: "رمز عبور باید حداقل ۸ کاراکتر باشد." };
  if (!parentFullName || !parentJob || !schoolName || !educationLevel || !householdIncomeBracket) {
    return { error: "همه‌ی فیلدهای الزامی را تکمیل کنید." };
  }

  const email = nationalIdToAuthEmail(parentNationalId);
  let parentProfileId: string;

  const { data: created, error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "parent", national_id: parentNationalId, full_name: parentFullName },
  });

  if (created?.user) {
    parentProfileId = created.user.id;
  } else if (createError?.code === "email_exists") {
    const { data: existing } = await service
      .from("profiles")
      .select("id")
      .eq("national_id", parentNationalId)
      .single();
    if (!existing) return { error: "خطا در بازیابی حساب موجود؛ با پشتیبانی تماس بگیرید." };
    parentProfileId = existing.id;
  } else {
    return { error: "ثبت‌نام ناموفق بود؛ دوباره تلاش کنید." };
  }

  const { error: insertError } = await service.from("parent_reports").insert({
    patient_file_id: tokenRow.patient_file_id,
    education_level: educationLevel,
    parent_job: parentJob,
    household_income_bracket: householdIncomeBracket as "under-10m" | "10m-30m" | "over-30m",
    school_name: schoolName,
  });
  if (insertError) return { error: "ثبت اطلاعات ناموفق بود؛ دوباره تلاش کنید." };

  await service.from("self_report_tokens").update({ used: true }).eq("token", token);

  const { data: doctorReport } = await service
    .from("doctor_reports")
    .select("id")
    .eq("patient_file_id", tokenRow.patient_file_id)
    .maybeSingle();

  await service
    .from("patient_files")
    .update({
      parent_id: parentProfileId,
      status: doctorReport ? "active" : "awaiting_doctor",
    })
    .eq("id", tokenRow.patient_file_id);

  await service.from("audit_logs").insert({
    actor_id: parentProfileId,
    action: "parent_report_submitted",
    target_table: "patient_files",
    target_id: tokenRow.patient_file_id,
  });

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    return { success: true, error: "اطلاعات ثبت شد؛ برای ورود از رمز عبور حساب قبلی خود استفاده کنید." };
  }

  redirect("/dashboard/parent");
}
