"use client";

import { useActionState } from "react";
import { createPatientFileAction } from "@/lib/patient-files/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import type { ActionState } from "@/lib/auth/actions";

const initialState: ActionState = {};

export function NewFileForm() {
  const [state, formAction, pending] = useActionState(createPatientFileAction, initialState);

  return (
    <form
      action={formAction}
      className="surface flex flex-col gap-4 rounded-[var(--radius-card)] p-6"
    >
      <h2 className="text-lg font-semibold text-primary-900">شروع پرونده جدید</h2>

      <Field label="کد ملی کودک">
        <input name="childNationalId" inputMode="numeric" maxLength={10} className="field-input" required />
      </Field>
      <Field label="نام و نام‌خانوادگی کودک">
        <input name="childFullName" className="field-input" required />
      </Field>
      <Field label="شماره موبایل پزشک (برای لینک خوداظهاری)">
        <input name="doctorPhone" inputMode="numeric" maxLength={11} className="field-input" required />
      </Field>
      <Field label="شماره موبایل والدین (برای لینک خوداظهاری)">
        <input name="parentPhone" inputMode="numeric" maxLength={11} className="field-input" required />
      </Field>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "در حال ثبت..." : "ثبت پرونده و ارسال لینک‌ها"}
      </Button>
    </form>
  );
}
