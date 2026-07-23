"use client";

import { useActionState } from "react";
import { createStaffAccountAction, type StaffActionState } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

const initialState: StaffActionState = {};

export function StaffAccountForm() {
  const [state, formAction, pending] = useActionState(createStaffAccountAction, initialState);

  return (
    <form action={formAction} className="surface flex flex-col gap-4 rounded-[var(--radius-card)] p-6">
      <h2 className="text-lg font-semibold text-primary-900">ساخت حساب کارکنان</h2>
      <Field label="نقش">
        <select name="role" className="field-input" defaultValue="social-worker">
          <option value="social-worker">مددکار اجتماعی</option>
          <option value="admin">مدیر سیستم</option>
        </select>
      </Field>
      <Field label="نام و نام‌خانوادگی">
        <input name="fullName" className="field-input" required />
      </Field>
      <Field label="کد ملی">
        <input name="nationalId" inputMode="numeric" maxLength={10} className="field-input" required />
      </Field>
      <Field label="رمز عبور اولیه">
        <input name="password" type="password" minLength={8} className="field-input" required />
      </Field>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.success && <p className="text-sm text-primary-700">حساب با موفقیت ساخته شد.</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "در حال ساخت..." : "ساخت حساب"}
      </Button>
    </form>
  );
}
