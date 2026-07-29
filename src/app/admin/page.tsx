import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { StaffAccountForm } from "@/components/admin/staff-account-form";
import { PendingDoctors } from "@/components/admin/pending-doctors";
import { PendingSupportRequests } from "@/components/admin/pending-support-requests";
import { AuditLogTable } from "@/components/admin/audit-log-table";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminDashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [{ data: pendingDoctors }, { data: pendingRequests }, { data: logs }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, national_id, role, created_at").in("role", ["doctor", "psychologist"]).eq("verified", false),
    supabase.from("support_requests").select("id, patient_file_id, category, description, city, required_amount, created_at").eq("status", "pending"),
    supabase.from("audit_logs").select("id, action, target_table, target_id, created_at").order("created_at", { ascending: false }).limit(20),
  ]);

  const patientFileIds = [...new Set((pendingRequests ?? []).map((r) => r.patient_file_id))];
  const { data: relatedFiles } = patientFileIds.length
    ? await supabase.from("patient_files").select("id, child_full_name").in("id", patientFileIds)
    : { data: [] };
  const childNameByFileId = new Map((relatedFiles ?? []).map((f) => [f.id, f.child_full_name]));

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold text-primary-900">داشبورد مدیر سیستم</h1>
      <p className="mt-2 text-primary-700">خوش آمدید، {profile?.full_name}.</p>

      <PendingDoctors doctors={pendingDoctors ?? []} />
      <PendingSupportRequests
        requests={pendingRequests ?? []}
        childNameByFileId={childNameByFileId}
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <AuditLogTable logs={logs ?? []} />
        <StaffAccountForm />
      </div>
    </main>
  );
}
