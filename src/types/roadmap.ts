export type EducationLevel = "preschool" | "elementary" | "middle-school" | "high-school";
export type DiseaseType = "leukemia" | "lymphoma" | "brain-tumor" | "solid-tumor" | "other";
export type Prognosis = "favorable" | "guarded" | "critical";
export type Complication =
  | "immune-suppression"
  | "cognitive-effects"
  | "mobility-limitation"
  | "fatigue"
  | "body-image"
  | "none";

export interface ChildProfileInput {
  educationLevel: EducationLevel;
  diseaseType: DiseaseType;
  prognosis: Prognosis;
  complications: Complication[];
}

export interface RoadmapRecommendation {
  title: string;
  description: string;
}

export type RoadmapCategoryKey = "educational" | "psychological" | "financial";

export interface RoadmapCategory {
  key: RoadmapCategoryKey;
  label: string;
  recommendations: RoadmapRecommendation[];
}

export type Roadmap = RoadmapCategory[];
