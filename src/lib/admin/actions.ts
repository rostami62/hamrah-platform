"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service-client";
import { getCurrentProfile } from "@/lib/auth/session";
import { nationalIdToAuthEmail } from "@/lib/auth/national-id-email";
import { validateNationalId } from "@/lib/validation/national-id";
import type { UserRole } from "@/types/roles";

export interface StaffActionState {
  error?: string;
  success?: boolean;
}

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") throw new Error("دسترسی غیرمجاز.");
  return profile;
}

export async function verifyDoctorAction(profileId: string): Promise<void> {
  const admin = await requireAdmin();
  const supabase = await createClient();
  await supabase.from("profiles").update({ verified: true }).eq("id", profileId);

  const service = createServiceClient();
  await service.from("audit_logs").insert({
    actor_id: admin.id,
    action: "doctor_verified",
    target_table: "profiles",
    target_id: profileId,
  });

  revalidatePath("/admin");
}

export async function reviewSupportRequestAction(
  requestId: string,
  status: "approved" | "rejected"
): Promise<void> {
  const admin = await requireAdmin();
  const supabase = await createClient();
  await supabase.from("support_requests").update({ status }).eq("id", requestId);

  const service = createServiceClient();
  await service.from("audit_logs").insert({
    actor_id: admin.id,
    action: status === "approved" ? "support_request_approved" : "support_request_rejected",
    target_table: "support_requests",
    target_id: requestId,
  });

  revalidatePath("/admin");
}

export async function createStaffAccountAction(
  _prevState: StaffActionState,
  formData: FormData
): Promise<StaffActionState> {
  const admin = await requireAdmin();

  const role = String(formData.get("role") ?? "") as UserRole;
  const nationalId = String(formData.get("nationalId") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!["social-worker", "admin"].includes(role)) {
    return { error: "نقش نامعتبر است." };
  }
  if (!validateNationalId(nationalId)) return { error: "کد ملی معتبر نیست." };
  if (password.length < 8) return { error: "رمز عبور باید حداقل ۸ کاراکتر باشد." };
  if (!fullName) return { error: "نام و نام‌خانوادگی را وارد کنید." };

  const service = createServiceClient();
  const { error: createError } = await service.auth.admin.createUser({
    email: nationalIdToAuthEmail(nationalId),
    password,
    email_confirm: true,
    user_metadata: { role, national_id: nationalId, full_name: fullName },
  });

  if (createError) {
    return {
      error:
        createError.code === "email_exists"
          ? "کاربری با این کد ملی قبلاً ثبت‌نام کرده است."
          : "ساخت حساب ناموفق بود.",
    };
  }

  await service.from("audit_logs").insert({
    actor_id: admin.id,
    action: `staff_account_created:${role}`,
    target_table: "profiles",
  });

  revalidatePath("/admin");
  return { success: true };
}
