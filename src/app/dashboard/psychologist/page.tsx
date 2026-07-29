import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { PsychologyReportForm } from "@/components/patient-files/psychology-report-form";
import { CONCERN_BAND_LABELS } from "@/lib/mental-health/scoring";

export default async function PsychologistDashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile?.verified) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-primary-900">در انتظار تایید هویت</h1>
        <p className="mt-2 text-primary-700">
          حساب شما ثبت شده اما هنوز توسط مدیر سیستم تایید نشده است. پس از
          تایید، به پرونده‌های متصل به شما دسترسی خواهید داشت.
        </p>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: files } = await supabase
    .from("patient_files")
    .select("id, child_full_name, status, created_at")
    .eq("psychologist_id", profile.id)
    .order("created_at", { ascending: false });

  const fileIds = (files ?? []).map((f) => f.id);
  const [{ data: reports }, { data: mentalHealthResults }, { data: medicalReports }] = await Promise.all([
    fileIds.length
      ? supabase.from("psychology_reports").select("*").in("patient_file_id", fileIds)
      : Promise.resolve({ data: [] as { patient_file_id: string; behavioral_assessment: string | null; therapy_session_notes: string | null; mental_status: string | null }[] }),
    fileIds.length
      ? supabase.from("mental_health_results").select("patient_file_id, band, total_score, max_score, completed_at").in("patient_file_id", fileIds).order("completed_at", { ascending: false })
      : Promise.resolve({ data: [] as { patient_file_id: string; band: string; total_score: number; max_score: number; completed_at: string }[] }),
    // دسترسی خواندنِ متقابل تیم درمانی (پزشک/روان‌شناسِ همان پرونده) — پس از اجرای migration 0005
    fileIds.length
      ? supabase.from("medical_reports").select("patient_file_id, diagnosis").in("patient_file_id", fileIds)
      : Promise.resolve({ data: [] as { patient_file_id: string; diagnosis: string | null }[] }),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold text-primary-900">داشبورد روان‌شناس / مشاور</h1>
      <p className="mt-2 text-primary-700">خوش آمدید، {profile.full_name}.</p>

      <div className="mt-8 flex flex-col gap-3">
        {(files ?? []).length === 0 && (
          <p className="text-sm text-primary-600">
            هنوز پرونده‌ای توسط مددکار اجتماعی به شما ارجاع نشده است.
          </p>
        )}
        {(files ?? []).map((file) => {
          const report = (reports ?? []).find((r) => r.patient_file_id === file.id) ?? null;
          const latestScreening = (mentalHealthResults ?? []).find((m) => m.patient_file_id === file.id);
          const medicalReport = (medicalReports ?? []).find((m) => m.patient_file_id === file.id);
          return (
            <article key={file.id} className="surface rounded-[var(--radius-card)] p-5">
              <h3 className="font-semibold text-primary-900">{file.child_full_name}</h3>

              {(latestScreening || medicalReport?.diagnosis) && (
                <div className="mt-2 flex flex-col gap-1 rounded-[var(--radius-control)] bg-surface-2 p-3 text-xs text-primary-700">
                  <p className="font-semibold text-primary-600">زمینه‌ی بالینی</p>
                  {latestScreening && (
                    <p>
                      آخرین چک-این سلامت روان (توسط والدین):{" "}
                      {CONCERN_BAND_LABELS[latestScreening.band as keyof typeof CONCERN_BAND_LABELS] ?? latestScreening.band}
                      {" "}({latestScreening.total_score}/{latestScreening.max_score}) —{" "}
                      {new Date(latestScreening.completed_at).toLocaleDateString("fa-IR")}
                    </p>
                  )}
                  {medicalReport?.diagnosis && <p>تشخیص پزشک: {medicalReport.diagnosis}</p>}
                </div>
              )}

              <PsychologyReportForm patientFileId={file.id} initial={report} />
            </article>
          );
        })}
      </div>
    </main>
  );
}
