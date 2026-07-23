"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { loadOfflineContent, saveOfflineContent } from "@/lib/storage";
import { LIKERT_LABELS, MENTAL_HEALTH_QUESTIONS } from "@/lib/mental-health/questions";
import { submitMentalHealthResultAction } from "@/lib/mental-health/actions";
import { scoreQuestionnaire } from "@/lib/mental-health/scoring";
import { cn } from "@/lib/utils";
import { ResultBanner } from "./result-banner";
import { QuestionnaireHistory } from "./questionnaire-history";
import type { LikertValue, QuestionnaireResult } from "@/types/mental-health";

const HISTORY_KEY = "mental-health-history";
const LIKERT_VALUES: LikertValue[] = [0, 1, 2, 3];

export function QuestionnaireForm({ patientFileId }: { patientFileId?: string }) {
  const [answers, setAnswers] = useState<Record<string, LikertValue>>({});
  // مقدار اولیه آرایه‌ی خالی است تا با رندر سرور یکسان بماند؛ خواندن از
  // LocalStorage پس از mount در کلاینت انجام می‌شود (جلوگیری از خطای
  // hydration mismatch).
  const [history, setHistory] = useState<QuestionnaireResult[]>([]);
  const [latestResult, setLatestResult] = useState<QuestionnaireResult | null>(null);

  useEffect(() => {
    const saved = loadOfflineContent<QuestionnaireResult[]>(HISTORY_KEY);
    if (saved) setHistory(saved);
  }, []);

  const isComplete = MENTAL_HEALTH_QUESTIONS.every((q) => answers[q.id] !== undefined);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isComplete) return;

    const result = scoreQuestionnaire(
      MENTAL_HEALTH_QUESTIONS.map((q) => ({ itemId: q.id, value: answers[q.id]! }))
    );
    const nextHistory = [result, ...history];
    setHistory(nextHistory);
    setLatestResult(result);
    saveOfflineContent(HISTORY_KEY, nextHistory);
    setAnswers({});

    if (patientFileId) {
      await submitMentalHealthResultAction(patientFileId, result);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {latestResult && <ResultBanner result={latestResult} />}

      <p className="text-xs text-primary-500">
        {patientFileId
          ? "نتیجه، هم روی این دستگاه و هم در پرونده‌ی الکترونیک فرزندتان ذخیره می‌شود."
          : "برای ثبت خودکار نتیجه در پرونده‌ی الکترونیک، ابتدا وارد حساب والدین شوید؛ در غیر این صورت فقط روی همین دستگاه ذخیره می‌شود."}
      </p>

      <form onSubmit={handleSubmit} className="surface flex flex-col gap-6 rounded-[var(--radius-card)] p-6">
        {MENTAL_HEALTH_QUESTIONS.map((question) => (
          <fieldset key={question.id} className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-primary-800">
              {question.prompt}
            </legend>
            <div className="flex flex-wrap gap-2">
              {LIKERT_VALUES.map((value) => (
                <label
                  key={value}
                  className={cn(
                    "cursor-pointer rounded-[var(--radius-control)] border px-3 py-1.5 text-sm",
                    answers[question.id] === value
                      ? "border-primary-600 bg-primary-600 text-white"
                      : "border-line bg-surface text-primary-700 hover:bg-primary-50"
                  )}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={value}
                    checked={answers[question.id] === value}
                    onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
                    className="sr-only"
                  />
                  {LIKERT_LABELS[value]}
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <Button type="submit" disabled={!isComplete} className="self-start">
          ثبت پرسشنامه
        </Button>
      </form>

      <QuestionnaireHistory history={history} />
    </div>
  );
}
