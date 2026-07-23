"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitParentReportAction, type SelfReportState } from "@/lib/patient-files/parent-report-actions";
import { EDUCATION_LEVEL_OPTIONS } from "@/lib/roadmap/options";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

const INCOME_BRACKET_OPTIONS: Record<string, string> = {
  "under-10m": "کمتر از ۱۰ میلیون تومان",
  "10m-30m": "۱۰ تا ۳۰ میلیون تومان",
  "over-30m": "بیش از ۳۰ میلیون تومان",
};

const initialState: SelfReportState = {};

export function ParentReportForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(submitParentReportAction, initialState);

  if (state.success) {
    return (
      <div className="surface flex flex-col items-center gap-2 rounded-[var(--radius-card)] p-6 text-center">
        <p className="font-semibold text-primary-900">اطلاعات شما ثبت شد.</p>
        {state.error && <p className="text-sm text-primary-600">{state.error}</p>}
        <Link href="/login" className="mt-2 text-sm font-medium text-primary-700">
          ورود به داشبورد
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="surface flex flex-col gap-4 rounded-[var(--radius-card)] p-6">
      <input type="hidden" name="token" value={token} />

      <p className="text-xs text-primary-500">
        با تکمیل این فرم، حساب کاربری شما در سامانه ساخته می‌شود تا بتوانید
        نقشه راه، منابع حمایتی و پرونده‌ی فرزندتان را دنبال کنید.
      </p>

      <Field label="نام و نام‌خانوادگی شما">
        <input name="parentFullName" className="field-input" required />
      </Field>
      <Field label="کد ملی شما">
        <input name="parentNationalId" inputMode="numeric" maxLength={10} className="field-input" required />
      </Field>
      <Field label="رمز عبور برای ورود بعدی">
        <input name="password" type="password" minLength={8} className="field-input" required />
      </Field>

      <Field label="مقطع تحصیلی کودک">
        <select name="educationLevel" className="field-input" defaultValue="elementary">
          {Object.entries(EDUCATION_LEVEL_OPTIONS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </Field>
      <Field label="شغل شما">
        <input name="parentJob" className="field-input" required />
      </Field>
      <Field label="بازه درآمد خانوار">
        <select name="householdIncomeBracket" className="field-input" defaultValue="10m-30m">
          {Object.entries(INCOME_BRACKET_OPTIONS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </Field>
      <Field label="نام مدرسه کودک">
        <input name="schoolName" className="field-input" required />
      </Field>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "در حال ثبت..." : "ثبت اطلاعات و ساخت حساب"}
      </Button>
    </form>
  );
}
