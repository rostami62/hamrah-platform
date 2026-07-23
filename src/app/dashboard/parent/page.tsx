import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";

const STATUS_LABELS: Record<string, string> = {
  draft: "در انتظار ارسال لینک‌ها",
  awaiting_doctor: "در انتظار خوداظهاری پزشک",
  awaiting_parent: "در انتظار تکمیل توسط شما",
  active: "تکمیل و فعال",
};

export default async function ParentDashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: files } = await supabase
    .from("patient_files")
    .select("id, child_full_name, status, created_at")
    .eq("parent_id", profile!.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold text-primary-900">داشبورد والدین</h1>
      <p className="mt-2 text-primary-700">خوش آمدید، {profile?.full_name}.</p>

      <div className="mt-8 flex flex-col gap-4">
        {(files ?? []).length === 0 && (
          <p className="text-sm text-primary-600">
            هنوز پرونده‌ای برای شما ثبت نشده است.
          </p>
        )}
        {(files ?? []).map((file) => (
          <article key={file.id} className="surface rounded-[var(--radius-card)] p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-primary-900">{file.child_full_name}</h3>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                {STATUS_LABELS[file.status] ?? file.status}
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <DashboardLink href="/roadmap" label="نقشه راه اختصاصی" />
        <DashboardLink href="/mental-health-check" label="غربالگری سلامت روان" />
        <DashboardLink href="/resources" label="منابع حمایتی" />
      </div>
    </main>
  );
}

function DashboardLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="surface rounded-[var(--radius-card)] p-4 text-center text-sm font-medium text-primary-800 hover:bg-primary-50"
    >
      {label}
    </Link>
  );
}
