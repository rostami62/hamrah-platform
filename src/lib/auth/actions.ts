"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service-client";
import { nationalIdToAuthEmail } from "@/lib/auth/national-id-email";
import { ensureProfile } from "@/lib/auth/ensure-profile";
import { validateNationalId } from "@/lib/validation/national-id";
import { ROLE_DASHBOARD_PATH, type UserRole } from "@/types/roles";

export interface ActionState {
  error?: string;
}

/** نقش‌هایی که خودشان می‌توانند ثبت‌نام کنند؛ مددکار/ادمین را فقط ادمین می‌سازد. */
const SELF_REGISTERABLE_ROLES: UserRole[] = ["doctor", "teacher", "donor"];

export async function registerAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const nationalId = String(formData.get("nationalId") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const role = String(formData.get("role") ?? "") as UserRole;

  if (!validateNationalId(nationalId)) {
    return { error: "کد ملی وارد شده معتبر نیست." };
  }
  if (password.length < 8) {
    return { error: "رمز عبور باید حداقل ۸ کاراکتر باشد." };
  }
  if (!fullName) {
    return { error: "نام و نام‌خانوادگی را وارد کنید." };
  }
  if (!SELF_REGISTERABLE_ROLES.includes(role)) {
    return { error: "این نقش امکان ثبت‌نام مستقیم ندارد." };
  }

  const email = nationalIdToAuthEmail(nationalId);
  const serviceClient = createServiceClient();

  // با service-role و email_confirm:true ساخته می‌شود چون ایمیل داخلی
  // واقعی نیست و امکان تایید از طریق لینک ایمیل وجود ندارد.
  const { data: created, error: createError } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, national_id: nationalId, full_name: fullName },
  });

  if (createError || !created.user) {
    if (createError?.code === "email_exists") {
      return { error: "کاربری با این کد ملی قبلاً ثبت‌نام کرده است." };
    }
    return { error: "ثبت‌نام ناموفق بود؛ دوباره تلاش کنید." };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    return { error: "ثبت‌نام انجام شد اما ورود خودکار ناموفق بود؛ از صفحه‌ی ورود اقدام کنید." };
  }

  redirect(ROLE_DASHBOARD_PATH[role]);
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const nationalId = String(formData.get("nationalId") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!validateNationalId(nationalId)) {
    return { error: "کد ملی وارد شده معتبر نیست." };
  }

  const supabase = await createClient();

  // اگر نشست قبلیِ کاربر دیگری هنوز فعال باشد، signInWithPassword روی
  // همان کلاینت می‌تواند بی‌صدا رد شود؛ برای تعویض حساب، ابتدا خروج
  // از نشست قبلی تضمین می‌شود.
  await supabase.auth.signOut();

  const { error } = await supabase.auth.signInWithPassword({
    email: nationalIdToAuthEmail(nationalId),
    password,
  });

  if (error) {
    return { error: "کد ملی یا رمز عبور نادرست است." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // معمولاً از trigger پایگاه‌داده (handle_new_user) خوانده می‌شود؛ اگر آن
  // به هر دلیل profile را نساخته باشد، اینجا از روی متادیتای حساب بازسازی
  // می‌شود تا کاربر با وجود ورود موفق، توسط middleware به /login برنگردد.
  const profile = await ensureProfile(user!);
  if (!profile) {
    return { error: "ورود موفق بود اما پروفایل کاربری پیدا نشد؛ با پشتیبانی تماس بگیرید." };
  }

  redirect(ROLE_DASHBOARD_PATH[profile.role]);
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
