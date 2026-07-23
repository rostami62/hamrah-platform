import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { NewFileForm } from "@/components/social-worker/new-file-form";
import { SupportRequestForm } from "@/components/social-worker/support-request-form";

const STATUS_LABELS: Record<string, string> = {
  draft: "در انتظار ارسال",
  awaiting_doctor: "در انتظار خوداظهاری پزشک",
  awaiting_parent: "در انتظار خوداظهاری والدین",
  active: "تکمیل و فعال",
};

export default async function SocialWorkerDashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: files } = await supabase
    .from("patient_files")
    .select("id, child_full_name, status, created_at")
    .eq("created_by", profile!.id)
    .order("created_at", { ascending: false });

  const fileIds = (files ?? []).map((f) => f.id);
  const { data: pendingTokens } = fileIds.length
    ? await supabase
        .from("self_report_tokens")
        .select("patient_file_id, role, token, used")
        .in("patient_file_id", fileIds)
        .eq("used", false)
    : { data: [] };

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold text-primary-900">داشبورد مددکار اجتماعی</h1>
      <p className="mt-2 text-primary-700">
        خوش آمدید، {profile?.full_name}. پرونده‌های ثبت‌شده توسط شما:
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="flex flex-col gap-3">
          {(files ?? []).length === 0 && (
            <p className="text-sm text-primary-600">هنوز پرونده‌ای ثبت نکرده‌اید.</p>
          )}
          {(files ?? []).map((file) => {
            const links = (pendingTokens ?? []).filter((t) => t.patient_file_id === file.id);
            return (
              <article key={file.id} className="surface rounded-[var(--radius-card)] p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-primary-900">{file.child_full_name}</h3>
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                    {STATUS_LABELS[file.status] ?? file.status}
                  </span>
                </div>
                {links.length > 0 && (
                  <ul className="mt-3 flex flex-col gap-1 text-xs text-primary-600">
                    {links.map((t) => (
                      <li key={t.token}>
                        لینک خوداظهاری {t.role === "doctor" ? "پزشک" : "والدین"} هنوز تکمیل
                        نشده — «{t.role === "doctor" ? "دکمه ارسال مجدد پیامک" : "دکمه ارسال مجدد پیامک"}»
                        در فاز بعد به این ردیف اضافه می‌شود.
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            );
          })}
        </section>

        <div className="flex flex-col gap-6">
          <NewFileForm />
          <SupportRequestForm files={files ?? []} />
        </div>
      </div>
    </main>
  );
}
