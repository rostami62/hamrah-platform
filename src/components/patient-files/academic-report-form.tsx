"use client";

import { useActionState } from "react";
import { saveAcademicReportAction } from "@/lib/patient-files/academic-report-actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import type { ActionState } from "@/lib/auth/actions";

const ATTENDANCE_OPTIONS: Record<string, string> = {
  regular: "منظم",
  irregular: "نامنظم",
  "frequent-absence": "غیبت مکرر",
};

const initialState: ActionState = {};

export function AcademicReportForm({
  patientFileId,
  initial,
}: {
  patientFileId: string;
  initial: {
    academic_performance: string | null;
    school_behavior: string | null;
    attendance_status: string | null;
    educational_needs: string | null;
  } | null;
}) {
  const [state, formAction, pending] = useActionState(saveAcademicReportAction, initialState);

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-3">
      <input type="hidden" name="patientFileId" value={patientFileId} />

      <Field label="عملکرد تحصیلی">
        <textarea name="academicPerformance" rows={2} defaultValue={initial?.academic_performance ?? ""} className="field-input" />
      </Field>
      <Field label="رفتار اجتماعی در کلاس">
        <textarea name="schoolBehavior" rows={2} defaultValue={initial?.school_behavior ?? ""} className="field-input" />
      </Field>
      <Field label="وضعیت حضور">
        <select name="attendanceStatus" defaultValue={initial?.attendance_status ?? "regular"} className="field-input">
          {Object.entries(ATTENDANCE_OPTIONS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </Field>
      <Field label="نیازمندی‌های آموزشی">
        <textarea name="educationalNeeds" rows={2} defaultValue={initial?.educational_needs ?? ""} className="field-input" />
      </Field>

      {state.error && <p className="text-xs text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending} className="self-start px-4 py-1.5 text-xs">
        {pending ? "در حال ذخیره..." : "ثبت و ذخیره گزارش"}
      </Button>
    </form>
  );
}
