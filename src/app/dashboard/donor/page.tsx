import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";

const CATEGORY_LABELS: Record<string, string> = {
  medical: "درمانی",
  educational: "آموزشی",
  housing: "اقامت",
  other: "سایر",
};

export default async function DonorDashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from("donor_visible_requests")
    .select("id, category, description, city, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold text-primary-900">داشبورد خیّرین</h1>
      <p className="mt-2 text-primary-700">
        خوش آمدید، {profile?.full_name}. این فهرست کاملاً غیرشخصی است — هیچ
        نام یا کد ملی کودک/خانواده در آن نمایش داده نمی‌شود.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {(requests ?? []).length === 0 && (
          <p className="text-sm text-primary-600">در حال حاضر نیاز تاییدشده‌ای موجود نیست.</p>
        )}
        {(requests ?? []).map((r) => (
          <article key={r.id} className="surface rounded-[var(--radius-card)] p-5">
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
              {CATEGORY_LABELS[r.category] ?? r.category}
            </span>
            <p className="mt-2 text-sm text-primary-800">{r.description}</p>
            {r.city && <p className="mt-1 text-xs text-primary-500">شهر: {r.city}</p>}
          </article>
        ))}
      </div>
    </main>
  );
}
