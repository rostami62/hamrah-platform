import { CONCERN_BAND_LABELS } from "@/lib/mental-health/scoring";
import { cn } from "@/lib/utils";
import type { QuestionnaireResult } from "@/types/mental-health";

export function ResultBanner({ result }: { result: QuestionnaireResult }) {
  const isUrgent = result.band === "needs-attention";
  return (
    <div
      role="status"
      className={cn(
        "rounded-[var(--radius-card)] border p-5",
        isUrgent
          ? "border-danger/30 bg-danger/10 text-danger"
          : "border-primary-200 bg-primary-50 text-primary-800"
      )}
    >
      <p className="font-semibold">{CONCERN_BAND_LABELS[result.band]}</p>
      <p className="mt-1 text-sm">
        {isUrgent
          ? "نتیجه‌ی این چک-این نشان‌دهنده‌ی نیاز به توجه است. لطفاً هرچه زودتر با روان‌شناس یا مددکار اجتماعی تیم درمانی تماس بگیرید."
          : "نتیجه به‌عنوان یک چک-این غیرتشخیصی ثبت شد. این ابزار جایگزین ارزیابی روان‌شناس نیست؛ نتیجه در گفتگوی بعدی با تیم درمانی مفید است."}
      </p>
    </div>
  );
}
