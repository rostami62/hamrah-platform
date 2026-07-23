import { MENTAL_HEALTH_QUESTIONS } from "./questions";
import type {
  ConcernBand,
  QuestionnaireResponse,
  QuestionnaireResult,
} from "@/types/mental-health";

const MAX_SCORE = MENTAL_HEALTH_QUESTIONS.length * 3;

function bandForScore(score: number): ConcernBand {
  const ratio = score / MAX_SCORE;
  if (ratio >= 0.65) return "needs-attention";
  if (ratio >= 0.35) return "moderate-concern";
  return "low-concern";
}

export function scoreQuestionnaire(
  responses: QuestionnaireResponse[]
): QuestionnaireResult {
  const totalScore = responses.reduce((sum, r) => sum + r.value, 0);
  return {
    completedAt: new Date().toISOString(),
    responses,
    totalScore,
    maxScore: MAX_SCORE,
    band: bandForScore(totalScore),
  };
}

export const CONCERN_BAND_LABELS: Record<ConcernBand, string> = {
  "low-concern": "بدون نگرانی قابل‌توجه",
  "moderate-concern": "نیازمند پیگیری",
  "needs-attention": "نیازمند توجه فوری تیم درمانی",
};
