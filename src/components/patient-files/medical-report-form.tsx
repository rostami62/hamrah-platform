"use client";

import { useActionState } from "react";
import { saveMedicalReportAction } from "@/lib/patient-files/medical-report-actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import type { ActionState } from "@/lib/auth/actions";

const initialState: ActionState = {};

export function MedicalReportForm({
  patientFileId,
  initial,
}: {
  patientFileId: string;
  initial: {
    diagnosis: string | null;
    medications: string | null;
    treatment_plan: string | null;
    next_visit_date: string | null;
  } | null;
}) {
  const [state, formAction, pending] = useActionState(saveMedicalReportAction, initialState);

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-3">
      <input type="hidden" name="patientFileId" value={patientFileId} />

      <Field label="تشخیص">
        <textarea name="diagnosis" rows={2} defaultValue={initial?.diagnosis ?? ""} className="field-input" />
      </Field>
      <Field label="داروهای تجویزشده">
        <textarea name="medications" rows={2} defaultValue={initial?.medications ?? ""} className="field-input" />
      </Field>
      <Field label="برنامه‌ی درمان">
        <textarea name="treatmentPlan" rows={2} defaultValue={initial?.treatment_plan ?? ""} className="field-input" />
      </Field>
      <Field label="تاریخ ویزیت بعدی">
        <input type="date" name="nextVisitDate" defaultValue={initial?.next_visit_date ?? ""} className="field-input" />
      </Field>

      {state.error && <p className="text-xs text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending} className="self-start px-4 py-1.5 text-xs">
        {pending ? "در حال ذخیره..." : "ثبت و ذخیره گزارش"}
      </Button>
    </form>
  );
}
