import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/service-client";
import { DoctorReportForm } from "@/components/self-report/doctor-report-form";
import { ParentReportForm } from "@/components/self-report/parent-report-form";

// این لینک‌ها توکن یک‌بارمصرف در URL دارند؛ هرگز نباید ایندکس یا کش عمومی شوند.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function SelfReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const service = createServiceClient();

  const { data: tokenRow } = await service
    .from("self_report_tokens")
    .select("token, role, used, expires_at, patient_file_id")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow) {
    return <StatusMessage title="لینک نامعتبر است" />;
  }
  if (tokenRow.used) {
    return <StatusMessage title="این لینک قبلاً استفاده شده است" />;
  }
  if (new Date(tokenRow.expires_at).getTime() < Date.now()) {
    return <StatusMessage title="این لینک منقضی شده است" description="با مددکار اجتماعی پرونده تماس بگیرید تا لینک جدید ارسال شود." />;
  }

  const { data: file } = await service
    .from("patient_files")
    .select("child_full_name")
    .eq("id", tokenRow.patient_file_id)
    .single();
  const childName = file?.child_full_name ?? "کودک";

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 px-6 py-16">
      <div>
        <p className="text-sm text-primary-600">فرم خوداظهاری برای پرونده‌ی</p>
        <h1 className="text-xl font-bold text-primary-900">{childName}</h1>
      </div>
      {tokenRow.role === "doctor" ? (
        <DoctorReportForm token={token} />
      ) : (
        <ParentReportForm token={token} />
      )}
    </main>
  );
}

function StatusMessage({ title, description }: { title: string; description?: string }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-xl font-bold text-primary-900">{title}</h1>
      {description && <p className="text-primary-600">{description}</p>}
    </main>
  );
}
