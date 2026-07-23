import { CONCERN_BAND_LABELS } from "@/lib/mental-health/scoring";
import type { QuestionnaireResult } from "@/types/mental-health";

export function QuestionnaireHistory({ history }: { history: QuestionnaireResult[] }) {
  if (history.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-primary-900">
        تاریخچه (ذخیره‌شده روی این دستگاه)
      </h2>
      <ul className="flex flex-col gap-2">
        {history.map((entry) => (
          <li
            key={entry.completedAt}
            className="surface flex items-center justify-between rounded-[var(--radius-control)] px-4 py-2 text-sm"
          >
            <span className="text-primary-700">
              {new Date(entry.completedAt).toLocaleDateString("fa-IR")}
            </span>
            <span className="font-medium text-primary-900">
              {CONCERN_BAND_LABELS[entry.band]} ({entry.totalScore}/{entry.maxScore})
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
