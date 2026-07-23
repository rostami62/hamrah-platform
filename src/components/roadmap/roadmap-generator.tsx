"use client";

import { useEffect, useState, type FormEvent } from "react";
import { generateRoadmap } from "@/lib/roadmap/generate-roadmap";
import {
  COMPLICATION_OPTIONS,
  DISEASE_TYPE_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  PROGNOSIS_OPTIONS,
} from "@/lib/roadmap/options";
import { loadOfflineContent, saveOfflineContent } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { RoadmapResult } from "./roadmap-result";
import type { ChildProfileInput, Complication, Roadmap } from "@/types/roadmap";

const STORAGE_KEY = "roadmap-result";

const DEFAULT_INPUT: ChildProfileInput = {
  educationLevel: "elementary",
  diseaseType: "leukemia",
  prognosis: "favorable",
  complications: [],
};

export function RoadmapGenerator() {
  const [input, setInput] = useState<ChildProfileInput>(DEFAULT_INPUT);
  // مقدار اولیه null است تا با رندر سرور یکسان بماند؛ خواندن از
  // LocalStorage پس از mount در کلاینت انجام می‌شود (جلوگیری از خطای
  // hydration mismatch).
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);

  useEffect(() => {
    const saved = loadOfflineContent<Roadmap>(STORAGE_KEY);
    if (saved) setRoadmap(saved);
  }, []);

  function toggleComplication(value: Complication, checked: boolean) {
    setInput((prev) => {
      if (value === "none") {
        return { ...prev, complications: checked ? ["none"] : [] };
      }
      const withoutNone = prev.complications.filter((c) => c !== "none");
      return {
        ...prev,
        complications: checked
          ? [...withoutNone, value]
          : withoutNone.filter((c) => c !== value),
      };
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = generateRoadmap(input);
    setRoadmap(result);
    saveOfflineContent(STORAGE_KEY, result);
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="مقطع تحصیلی">
          <select
            className="field-input"
            value={input.educationLevel}
            onChange={(e) =>
              setInput((p) => ({
                ...p,
                educationLevel: e.target.value as ChildProfileInput["educationLevel"],
              }))
            }
          >
            {Object.entries(EDUCATION_LEVEL_OPTIONS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="نوع بیماری">
          <select
            className="field-input"
            value={input.diseaseType}
            onChange={(e) =>
              setInput((p) => ({
                ...p,
                diseaseType: e.target.value as ChildProfileInput["diseaseType"],
              }))
            }
          >
            {Object.entries(DISEASE_TYPE_OPTIONS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="پروگنوز (طبق نظر تیم درمانی)">
          <select
            className="field-input"
            value={input.prognosis}
            onChange={(e) =>
              setInput((p) => ({
                ...p,
                prognosis: e.target.value as ChildProfileInput["prognosis"],
              }))
            }
          >
            {Object.entries(PROGNOSIS_OPTIONS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-medium text-primary-800">
            عوارض فعلی (چندگزینه‌ای)
          </legend>
          {Object.entries(COMPLICATION_OPTIONS).map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2 text-sm text-primary-800"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-line accent-[var(--color-primary-600)]"
                checked={input.complications.includes(value as Complication)}
                onChange={(e) =>
                  toggleComplication(value as Complication, e.target.checked)
                }
              />
              {label}
            </label>
          ))}
        </fieldset>

        <Button type="submit">دریافت نقشه راه</Button>
      </form>

      <div>
        {roadmap ? (
          <RoadmapResult roadmap={roadmap} />
        ) : (
          <p className="text-sm text-primary-600">
            فرم را تکمیل کنید تا نقشه راه اختصاصی نمایش داده شود.
          </p>
        )}
      </div>
    </div>
  );
}
