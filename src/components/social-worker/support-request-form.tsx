"use client";

import { useActionState } from "react";
import { createSupportRequestAction } from "@/lib/support-requests/actions";
import type { ActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

const initialState: ActionState = {};

const CATEGORY_OPTIONS: Record<string, string> = {
  medical: "درمانی",
  educational: "آموزشی",
  housing: "اقامت",
  other: "سایر",
};

export function SupportRequestForm({
  files,
}: {
  files: { id: string; child_full_name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createSupportRequestAction, initialState);

  if (files.length === 0) return null;

  return (
    <form action={formAction} className="surface flex flex-col gap-4 rounded-[var(--radius-card)] p-6">
      <h2 className="text-lg font-semibold text-primary-900">ثبت درخواست حمایت مالی</h2>

      <Field label="پرونده">
        <select name="patientFileId" className="field-input">
          {files.map((f) => (
            <option key={f.id} value={f.id}>{f.child_full_name}</option>
          ))}
        </select>
      </Field>
      <Field label="نوع نیاز">
        <select name="category" className="field-input" defaultValue="medical">
          {Object.entries(CATEGORY_OPTIONS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </Field>
      <Field label="توضیح (بدون نام یا کد ملی کودک — برای خیّرین نمایش داده می‌شود)">
        <textarea name="description" rows={3} className="field-input" required />
      </Field>
      <Field label="شهر (اختیاری)">
        <input name="city" className="field-input" />
      </Field>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "در حال ثبت..." : "ثبت درخواست برای بررسی ادمین"}
      </Button>
    </form>
  );
}
