"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service-client";
import { validateNationalId } from "@/lib/validation/national-id";
import { sendSelfReportSms } from "@/lib/sms";
import type { ActionState } from "@/lib/auth/actions";

const TOKEN_TTL_DAYS = 7;

export async function createPatientFileAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "لطفاً دوباره وارد شوید." };

  const childNationalId = String(formData.get("childNationalId") ?? "").trim();
  const childFullName = String(formData.get("childFullName") ?? "").trim();
  const doctorPhone = String(formData.get("doctorPhone") ?? "").trim();
  const parentPhone = String(formData.get("parentPhone") ?? "").trim();

  if (!validateNationalId(childNationalId)) {
    return { error: "کد ملی کودک معتبر نیست." };
  }
  if (!childFullName) {
    return { error: "نام و نام‌خانوادگی کودک را وارد کنید." };
  }
  if (!/^09\d{9}$/.test(doctorPhone) || !/^09\d{9}$/.test(parentPhone)) {
    return { error: "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود." };
  }

  const { data: file, error: fileError } = await supabase
    .from("patient_files")
    .insert({ child_national_id: childNationalId, child_full_name: childFullName, created_by: user.id })
    .select("id")
    .single();

  if (fileError || !file) {
    return { error: "ثبت پرونده ناموفق بود؛ دوباره تلاش کنید." };
  }

  const service = createServiceClient();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data: tokens, error: tokenError } = await service
    .from("self_report_tokens")
    .insert([
      { patient_file_id: file.id, role: "doctor", phone: doctorPhone, expires_at: expiresAt },
      { patient_file_id: file.id, role: "parent", phone: parentPhone, expires_at: expiresAt },
    ])
    .select("token, role, phone");

  if (tokenError || !tokens) {
    return { error: "پرونده ساخته شد اما تولید لینک خوداظهاری ناموفق بود." };
  }

  await Promise.all(
    tokens.map((t) =>
      sendSelfReportSms(t.phone, `${siteUrl}/self-report/${t.token}`, t.role as "doctor" | "parent")
    )
  );

  await service.from("audit_logs").insert({
    actor_id: user.id,
    action: "patient_file_created",
    target_table: "patient_files",
    target_id: file.id,
  });

  revalidatePath("/dashboard/social-worker");
  return {};
}
