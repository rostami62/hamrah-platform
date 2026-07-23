"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

const initialState: ActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="surface flex flex-col gap-4 rounded-[var(--radius-card)] p-6">
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
        <input name="password" type="password" className="field-input" required />
      </Field>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "در حال ورود..." : "ورود"}
      </Button>
    </form>
  );
}
