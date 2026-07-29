import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { AcademicReportForm } from "@/components/patient-files/academic-report-form";

export default async function TeacherDashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: files } = await supabase
    .from("patient_files")
    .select("id, child_full_name, status")
    .eq("teacher_id", profile!.id)
    .order("created_at", { ascending: false });

  const fileIds = (files ?? []).map((f) => f.id);
  const { data: reports } = fileIds.length
    ? await supabase.from("academic_reports").select("*").in("patient_file_id", fileIds)
    : { data: [] as { patient_file_id: string; academic_performance: string | null; school_behavior: string | null; attendance_status: string | null; educational_needs: string | null }[] };

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold text-primary-900">داشبورد معلم / آموزش‌یار</h1>
      <p className="mt-2 text-primary-700">خوش آمدید، {profile?.full_name}.</p>

      <div className="mt-8 flex flex-col gap-3">
        {(files ?? []).length === 0 ? (
          <div className="surface rounded-[var(--radius-card)] p-6 text-sm text-primary-600">
            هنوز دانش‌آموزی توسط مددکار اجتماعی به حساب شما ارجاع نشده است.
          </div>
        ) : (
          files!.map((file) => {
            const report = (reports ?? []).find((r) => r.patient_file_id === file.id) ?? null;
            return (
              <article key={file.id} className="surface rounded-[var(--radius-card)] p-5">
                <h3 className="font-semibold text-primary-900">{file.child_full_name}</h3>
                <AcademicReportForm patientFileId={file.id} initial={report} />
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}
