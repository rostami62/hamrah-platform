import "server-only";
import { createServiceClient } from "@/lib/supabase/service-client";

export interface SelfReportState {
  error?: string;
  success?: boolean;
}

/** اعتبارسنجی توکن یک‌بارمصرف خوداظهاری، مشترک بین اکشن‌های پزشک و والدین. */
export async function validateSelfReportToken(token: string, expectedRole: "doctor" | "parent") {
  const service = createServiceClient();
  const { data } = await service
    .from("self_report_tokens")
    .select("token, patient_file_id, role, used, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!data || data.role !== expectedRole) return { error: "لینک نامعتبر است." } as const;
  if (data.used) return { error: "این لینک قبلاً استفاده شده است." } as const;
  if (new Date(data.expires_at).getTime() < Date.now()) {
    return { error: "این لینک منقضی شده است." } as const;
  }
  return { service, tokenRow: data } as const;
}
