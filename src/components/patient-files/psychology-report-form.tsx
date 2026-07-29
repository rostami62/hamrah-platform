"use client";

import { useActionState } from "react";
import { savePsychologyReportAction } from "@/lib/patient-files/psychology-report-actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import type { ActionState } from "@/lib/auth/actions";

const initialState: ActionState = {};

export function PsychologyReportForm({
  patientFileId,
  initial,
}: {
  patientFileId: string;
  initial: {
    behavioral_assessment: string | null;
    therapy_session_notes: string | null;
    mental_status: string | null;
  } | null;
}) {
  const [state, formAction, pending] = useActionState(savePsychologyReportAction, initialState);

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-3">
      <input type="hidden" name="patientFileId" value={patientFileId} />

      <Field label="ارزیابی رفتاری">
        <textarea name="behavioralAssessment" rows={2} defaultValue={initial?.behavioral_assessment ?? ""} className="field-input" />
      </Field>
      <Field label="خلاصه‌ی جلسه‌ی درمانی">
        <textarea name="therapySessionNotes" rows={2} defaultValue={initial?.therapy_session_notes ?? ""} className="field-input" />
      </Field>
      <Field label="توصیه به خانواده/مدرسه — وضعیت روانی">
        <textarea name="mentalStatus" rows={2} defaultValue={initial?.mental_status ?? ""} className="field-input" />
      </Field>

      {state.error && <p className="text-xs text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending} className="self-start px-4 py-1.5 text-xs">
        {pending ? "در حال ذخیره..." : "ثبت و ذخیره گزارش"}
      </Button>
    </form>
  );
}
