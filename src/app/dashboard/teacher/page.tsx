import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { CaseNoteForm } from "@/components/patient-files/case-note-form";

export default async function TeacherDashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: files } = await supabase
    .from("patient_files")
    .select("id, child_full_name, status")
    .eq("teacher_id", profile!.id)
    .order("created_at", { ascending: false });

  const fileIds = (files ?? []).map((f) => f.id);
  const { data: notes } = fileIds.length
    ? await supabase.from("case_notes").select("patient_file_id, note").eq("role", "teacher").in("patient_file_id", fileIds)
    : { data: [] as { patient_file_id: string; note: string }[] };

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
            const note = (notes ?? []).find((n) => n.patient_file_id === file.id);
            return (
              <article key={file.id} className="surface rounded-[var(--radius-card)] p-5">
                <h3 className="font-semibold text-primary-900">{file.child_full_name}</h3>
                <CaseNoteForm patientFileId={file.id} role="teacher" initialNote={note?.note ?? ""} />
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}
