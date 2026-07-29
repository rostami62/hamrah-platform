"use client";

import { useActionState } from "react";
import { updateCaseStatusAction } from "@/lib/patient-files/case-status-actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import type { ActionState } from "@/lib/auth/actions";
import type { CaseStatus, CaseUrgency } from "@/types/database";

const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  open: "باز",
  under_review: "در حال بررسی",
  completed: "تکمیل‌شده",
};
const URGENCY_LABELS: Record<CaseUrgency, string> = {
  low: "کم",
  medium: "متوسط",
  high: "بالا",
  emergency: "اورژانسی",
};

const initialState: ActionState = {};

export function CaseStatusForm({
  patientFileId,
  caseStatus,
  urgency,
}: {
  patientFileId: string;
  caseStatus: CaseStatus;
  urgency: CaseUrgency;
}) {
  const [state, formAction, pending] = useActionState(updateCaseStatusAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="patientFileId" value={patientFileId} />
      <Field label="وضعیت پرونده">
        <select name="caseStatus" defaultValue={caseStatus} className="field-input">
          {Object.entries(CASE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </Field>
      <Field label="سطح فوریت">
        <select name="urgency" defaultValue={urgency} className="field-input">
          {Object.entries(URGENCY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </Field>
      <Button type="submit" disabled={pending} className="px-4 py-2 text-xs">
        {pending ? "..." : "ذخیره"}
      </Button>
      {state.error && <p className="w-full text-xs text-danger">{state.error}</p>}
    </form>
  );
}
