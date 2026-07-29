import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { PledgeForm } from "@/components/donor/pledge-form";

const CATEGORY_LABELS: Record<string, string> = {
  medical: "درمانی",
  educational: "آموزشی",
  housing: "اقامت",
  other: "سایر",
};

const PLEDGE_STATUS_LABELS: Record<string, string> = {
  pledged: "در انتظار هماهنگی",
  fulfilled: "دریافت‌شده",
  cancelled: "لغوشده",
};

export default async function DonorDashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [{ data: requests }, { data: myPledges }] = await Promise.all([
    supabase
      .from("donor_visible_requests")
      .select("id, category, description, city, required_amount, raised_amount, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("donation_pledges")
      .select("id, support_request_id, amount, status, created_at")
      .eq("donor_id", profile!.id)
      .order("created_at", { ascending: false }),
  ]);

  const pledgedRequestIds = new Set((myPledges ?? []).map((p) => p.support_request_id));

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold text-primary-900">داشبورد خیّرین</h1>
      <p className="mt-2 text-primary-700">
        خوش آمدید، {profile?.full_name}. این فهرست کاملاً غیرشخصی است — هیچ
        نام یا کد ملی کودک/خانواده در آن نمایش داده نمی‌شود.
      </p>

      {(myPledges ?? []).length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-primary-900">مشارکت‌های من</h2>
          <div className="flex flex-col gap-2">
            {myPledges!.map((p) => (
              <div key={p.id} className="surface flex items-center justify-between rounded-[var(--radius-control)] p-3 text-sm">
                <span className="text-primary-800">{p.amount.toLocaleString("fa-IR")} تومان</span>
                <span className="text-xs text-primary-600">{PLEDGE_STATUS_LABELS[p.status] ?? p.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-primary-900">نیازهای تاییدشده</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {(requests ?? []).length === 0 && (
            <p className="text-sm text-primary-600">در حال حاضر نیاز تاییدشده‌ای موجود نیست.</p>
          )}
          {(requests ?? []).map((r) => {
            const percent =
              r.required_amount && r.required_amount > 0
                ? Math.min(100, Math.round((r.raised_amount / r.required_amount) * 100))
                : null;
            return (
              <article key={r.id} className="surface flex flex-col gap-2 rounded-[var(--radius-card)] p-5">
                <span className="w-fit rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                  {CATEGORY_LABELS[r.category] ?? r.category}
                </span>
                <p className="text-sm text-primary-800">{r.description}</p>
                {r.city && <p className="text-xs text-primary-500">شهر: {r.city}</p>}

                {r.required_amount != null && (
                  <div className="mt-1">
                    <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-primary-600" style={{ width: `${percent ?? 0}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-primary-600">
                      {r.raised_amount.toLocaleString("fa-IR")} از {r.required_amount.toLocaleString("fa-IR")} تومان
                      ({percent}%)
                    </p>
                  </div>
                )}

                <div className="mt-2">
                  {pledgedRequestIds.has(r.id) ? (
                    <p className="text-xs text-primary-600">شما قبلاً برای این مورد قصد مشارکت ثبت کرده‌اید.</p>
                  ) : (
                    <PledgeForm supportRequestId={r.id} />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
