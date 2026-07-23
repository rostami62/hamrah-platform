import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function TeacherDashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: files } = await supabase
    .from("patient_files")
    .select("id, child_full_name, status")
    .eq("teacher_id", profile!.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold text-primary-900">داشبورد معلم / آموزش‌یار</h1>
      <p className="mt-2 text-primary-700">خوش آمدید، {profile?.full_name}.</p>

      <div className="mt-8 flex flex-col gap-3">
        {(files ?? []).length === 0 ? (
          <div className="surface rounded-[var(--radius-card)] p-6 text-sm text-primary-600">
            هنوز دانش‌آموزی به حساب شما متصل نشده است. اتصال معلم به پرونده
            (توسط مددکار یا والدین) در نسخه‌ی بعدی سامانه اضافه می‌شود.
          </div>
        ) : (
          files!.map((file) => (
            <article key={file.id} className="surface rounded-[var(--radius-card)] p-5">
              <h3 className="font-semibold text-primary-900">{file.child_full_name}</h3>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
