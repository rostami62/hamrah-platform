import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { DISEASE_TYPE_OPTIONS, PROGNOSIS_OPTIONS } from "@/lib/roadmap/options";

export default async function DoctorDashboardPage() {
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
    .eq("doctor_id", profile.id)
    .order("created_at", { ascending: false });

  const fileIds = (files ?? []).map((f) => f.id);
  const { data: reports } = fileIds.length
    ? await supabase.from("doctor_reports").select("patient_file_id, disease_type, prognosis").in("patient_file_id", fileIds)
    : { data: [] };

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold text-primary-900">داشبورد پزشک و روان‌شناس</h1>
      <p className="mt-2 text-primary-700">خوش آمدید، {profile.full_name}.</p>

      <div className="mt-8 flex flex-col gap-3">
        {(files ?? []).length === 0 && (
          <p className="text-sm text-primary-600">
            هنوز پرونده‌ای از طریق لینک خوداظهاری به شما متصل نشده است.
          </p>
        )}
        {(files ?? []).map((file) => {
          const report = (reports ?? []).find((r) => r.patient_file_id === file.id);
          return (
            <article key={file.id} className="surface rounded-[var(--radius-card)] p-5">
              <h3 className="font-semibold text-primary-900">{file.child_full_name}</h3>
              {report && (
                <p className="mt-1 text-sm text-primary-600">
                  {DISEASE_TYPE_OPTIONS[report.disease_type as keyof typeof DISEASE_TYPE_OPTIONS] ?? report.disease_type}
                  {" — "}
                  {PROGNOSIS_OPTIONS[report.prognosis as keyof typeof PROGNOSIS_OPTIONS] ?? report.prognosis}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
