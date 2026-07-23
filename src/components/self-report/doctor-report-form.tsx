"use client";

import { useActionState } from "react";
import { submitDoctorReportAction, type SelfReportState } from "@/lib/patient-files/doctor-report-actions";
import {
  COMPLICATION_OPTIONS,
  DISEASE_TYPE_OPTIONS,
  PROGNOSIS_OPTIONS,
} from "@/lib/roadmap/options";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

const TREATMENT_DURATION_OPTIONS: Record<string, string> = {
  "under-6-months": "کمتر از ۶ ماه",
  "6-to-12-months": "۶ تا ۱۲ ماه",
  "over-12-months": "بیش از ۱۲ ماه",
};

const initialState: SelfReportState = {};

export function DoctorReportForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(submitDoctorReportAction, initialState);

  if (state.success) {
    return (
      <div className="surface rounded-[var(--radius-card)] p-6 text-center">
        <p className="font-semibold text-primary-900">گزارش شما با موفقیت ثبت شد.</p>
        <p className="mt-1 text-sm text-primary-600">سپاسگزاریم از همراهی شما.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="surface flex flex-col gap-4 rounded-[var(--radius-card)] p-6">
      <input type="hidden" name="token" value={token} />

      <Field label="نوع بیماری">
        <select name="diseaseType" className="field-input" defaultValue="leukemia">
          {Object.entries(DISEASE_TYPE_OPTIONS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </Field>

      <Field label="پروگنوز">
        <select name="prognosis" className="field-input" defaultValue="favorable">
          {Object.entries(PROGNOSIS_OPTIONS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </Field>

      <Field label="طول دوره درمان (تخمینی)">
        <select name="treatmentDuration" className="field-input" defaultValue="6-to-12-months">
          {Object.entries(TREATMENT_DURATION_OPTIONS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-medium text-primary-800">
          عوارض (چندگزینه‌ای)
        </legend>
        {Object.entries(COMPLICATION_OPTIONS).map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 text-sm text-primary-800">
            <input type="checkbox" name="complications" value={value} className="h-4 w-4 rounded border-line accent-[var(--color-primary-600)]" />
            {label}
          </label>
        ))}
      </fieldset>

      <Field label="توضیحات تکمیلی (اختیاری)">
        <textarea name="notes" rows={3} className="field-input" />
      </Field>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "در حال ثبت..." : "ثبت گزارش"}
      </Button>
    </form>
  );
}
