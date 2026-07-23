export type LikertValue = 0 | 1 | 2 | 3;

export interface QuestionnaireItem {
  id: string;
  prompt: string;
}

export interface QuestionnaireResponse {
  itemId: string;
  value: LikertValue;
}

export type ConcernBand = "low-concern" | "moderate-concern" | "needs-attention";

export interface QuestionnaireResult {
  completedAt: string;
  responses: QuestionnaireResponse[];
  totalScore: number;
  maxScore: number;
  band: ConcernBand;
}
