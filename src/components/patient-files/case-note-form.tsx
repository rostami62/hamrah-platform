"use client";

import { useActionState } from "react";
import { saveCaseNoteAction } from "@/lib/patient-files/case-notes-actions";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/auth/actions";
import type { CaseNoteRole } from "@/types/database";

const initialState: ActionState = {};

export function CaseNoteForm({
  patientFileId,
  role,
  initialNote,
  label = "گزارش / یادداشت شما برای این پرونده",
}: {
  patientFileId: string;
  role: CaseNoteRole;
  initialNote: string;
  label?: string;
}) {
  const [state, formAction, pending] = useActionState(saveCaseNoteAction, initialState);

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-2">
      <input type="hidden" name="patientFileId" value={patientFileId} />
      <input type="hidden" name="role" value={role} />

      <label htmlFor={`note-${role}-${patientFileId}`} className="text-xs font-medium text-primary-700">
        {label}
      </label>
      <textarea
        id={`note-${role}-${patientFileId}`}
        name="note"
        rows={3}
        defaultValue={initialNote}
        className="field-input"
        placeholder="یادداشت یا گزارش خود را اینجا بنویسید..."
      />

      {state.error && <p className="text-xs text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending} className="self-start px-4 py-1.5 text-xs">
        {pending ? "در حال ذخیره..." : "ثبت و ذخیره گزارش"}
      </Button>
    </form>
  );
}
