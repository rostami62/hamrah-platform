"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service-client";
import type { ActionState } from "@/lib/auth/actions";

/**
 * قصد مشارکت مالی خیّر با service client ثبت می‌شود: مجوز واقعی همین‌جا
 * به‌صورت صریح احراز می‌شود (کاربر لاگین‌کرده نقش donor دارد و درخواست
 * هدف approved است) — نه با اتکا به RLS جدول donation_pledges.
 */
export async function createPledgeAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supportRequestId = String(formData.get("supportRequestId") ?? "");
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim() || null;
  const amount = Number(amountRaw);

  if (!supportRequestId || !amountRaw || Number.isNaN(amount) || amount <= 0) {
    return { error: "مبلغ باید عددی معتبر و بزرگ‌تر از صفر باشد." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "لطفاً دوباره وارد شوید." };

  const service = createServiceClient();

  const { data: profile } = await service.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "donor") return { error: "فقط خیّرین می‌توانند قصد مشارکت ثبت کنند." };

  const { data: request } = await service
    .from("support_requests")
    .select("status")
    .eq("id", supportRequestId)
    .maybeSingle();
  if (request?.status !== "approved") return { error: "این درخواست هنوز تاییدشده نیست." };

  const { error } = await service.from("donation_pledges").insert({
    support_request_id: supportRequestId,
    donor_id: user.id,
    amount,
    message,
  });

  if (error) return { error: "ثبت قصد مشارکت ناموفق بود؛ دوباره تلاش کنید." };

  revalidatePath("/dashboard/donor");
  return {};
}

/**
 * مددکار یا ادمین پس از دریافت واقعی وجه، قول را «دریافت‌شده» علامت می‌زند.
 * مجوز اینجا صریح احراز می‌شود (صاحبِ پرونده یا ادمین) و نوشتن با service
 * client انجام می‌شود، نه با اتکا به RLS جدول donation_pledges.
 */
export async function markPledgeFulfilledAction(pledgeId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const service = createServiceClient();

  const { data: pledge } = await service
    .from("donation_pledges")
    .select("support_request_id, amount, status")
    .eq("id", pledgeId)
    .maybeSingle();
  if (!pledge || pledge.status === "fulfilled") return;

  const { data: request } = await service
    .from("support_requests")
    .select("raised_amount, patient_file_id")
    .eq("id", pledge.support_request_id)
    .maybeSingle();
  if (!request) return;

  const { data: profile } = await service.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const { data: file } = await service
    .from("patient_files")
    .select("created_by")
    .eq("id", request.patient_file_id)
    .maybeSingle();
  const isOwner = file?.created_by === user.id;
  const isAdmin = profile?.role === "admin";
  if (!isOwner && !isAdmin) return;

  await service
    .from("donation_pledges")
    .update({ status: "fulfilled", fulfilled_at: new Date().toISOString() })
    .eq("id", pledgeId);

  await service
    .from("support_requests")
    .update({ raised_amount: request.raised_amount + pledge.amount })
    .eq("id", pledge.support_request_id);

  revalidatePath(`/dashboard/social-worker/cases/${request.patient_file_id}`);
}
