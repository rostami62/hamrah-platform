import { reviewSupportRequestAction } from "@/lib/admin/actions";

const CATEGORY_LABELS: Record<string, string> = {
  medical: "درمانی",
  educational: "آموزشی",
  housing: "اقامت",
  other: "سایر",
};

interface PendingSupportRequest {
  id: string;
  patient_file_id: string;
  category: string;
  description: string;
}

export function PendingSupportRequests({
  requests,
  childNameByFileId,
}: {
  requests: PendingSupportRequest[];
  childNameByFileId: Map<string, string>;
}) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 text-lg font-semibold text-primary-900">
        درخواست‌های حمایتی در انتظار بررسی ({requests.length})
      </h2>
      <div className="flex flex-col gap-2">
        {requests.length === 0 && (
          <p className="text-sm text-primary-600">درخواستی در انتظار بررسی نیست.</p>
        )}
        {requests.map((req) => (
          <div key={req.id} className="surface rounded-[var(--radius-control)] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary-900">
                {CATEGORY_LABELS[req.category] ?? req.category} —{" "}
                {childNameByFileId.get(req.patient_file_id)}
              </span>
              <div className="flex gap-2">
                <form action={reviewSupportRequestAction.bind(null, req.id, "approved")}>
                  <button
                    type="submit"
                    className="rounded-[var(--radius-control)] bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
                  >
                    تایید
                  </button>
                </form>
                <form action={reviewSupportRequestAction.bind(null, req.id, "rejected")}>
                  <button
                    type="submit"
                    className="rounded-[var(--radius-control)] border border-line px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-50"
                  >
                    رد
                  </button>
                </form>
              </div>
            </div>
            <p className="mt-1 text-sm text-primary-600">{req.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
