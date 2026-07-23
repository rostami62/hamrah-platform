"use client";

import { useActionState } from "react";
import { registerAction, type ActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ROLE_LABELS_FA } from "@/types/roles";

const initialState: ActionState = {};
const SELF_REGISTERABLE_ROLES = ["doctor", "teacher", "donor"] as const;

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="surface flex flex-col gap-4 rounded-[var(--radius-card)] p-6">
      <Field label="نقش">
        <select name="role" className="field-input" defaultValue="doctor">
          {SELF_REGISTERABLE_ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS_FA[role]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="نام و نام‌خانوادگی">
        <input name="fullName" className="field-input" required />
      </Field>
      <Field label="کد ملی">
        <input
          name="nationalId"
          inputMode="numeric"
          maxLength={10}
          className="field-input"
          required
        />
      </Field>
      <Field label="رمز عبور">
        <input
          name="password"
          type="password"
          minLength={8}
          className="field-input"
          required
        />
      </Field>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <p className="text-xs text-primary-500">
        حساب پزشک/روان‌شناس تا تایید هویت توسط مدیر سیستم، دسترسی محدود
        خواهد داشت.
      </p>

      <Button type="submit" disabled={pending}>
        {pending ? "در حال ثبت‌نام..." : "ثبت‌نام"}
      </Button>
    </form>
  );
}
