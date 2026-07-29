"use client";

import { useActionState } from "react";
import { createReferralsAction } from "@/lib/patient-files/referrals-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/auth/actions";
import type { ReferralRole, ReferralStatus } from "@/types/database";

const ROLE_LABELS: Record<ReferralRole, string> = {
  doctor: "پزشک",
  psychologist: "روان‌شناس / مشاور",
  teacher: "معلم",
  donor: "خیّرین / حمایت مالی",
};
const ROLES: ReferralRole[] = ["doctor", "psychologist", "teacher", "donor"];

const STATUS_LABELS: Record<ReferralStatus, string> = {
  pending: "در انتظار",
  completed: "تکمیل‌شده",
};

const initialState: ActionState = {};

export function MultiReferralForm({
  patientFileId,
  existingReferrals,
}: {
  patientFileId: string;
  existingReferrals: { referred_to_role: ReferralRole; status: ReferralStatus }[];
}) {
  const [state, formAction, pending] = useActionState(createReferralsAction, initialState);
  const referredRoles = new Set(existingReferrals.map((r) => r.referred_to_role));

  return (
    <form action={formAction} className="mt-3">
      <input type="hidden" name="patientFileId" value={patientFileId} />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-xs font-medium text-primary-700">
          ارجاع هم‌زمان به بخش‌های تخصصی
        </legend>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((role) => {
            const existing = existingReferrals.find((r) => r.referred_to_role === role);
            return (
              <label
                key={role}
                className={cn(
                  "flex items-center gap-1.5 rounded-[var(--radius-control)] border px-3 py-1.5 text-xs",
                  existing
                    ? "border-line bg-surface-2 text-primary-600"
                    : "border-line bg-surface text-primary-800 hover:bg-primary-50"
                )}
              >
                <input
                  type="checkbox"
                  name="roles"
                  value={role}
                  defaultChecked={referredRoles.has(role)}
                  disabled={!!existing}
                  className="h-3.5 w-3.5 rounded border-line accent-[var(--color-primary-600)]"
                />
                {ROLE_LABELS[role]}
                {existing && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                      existing.status === "completed"
                        ? "bg-primary-100 text-primary-700"
                        : "bg-accent-50 text-accent-700"
                    )}
                  >
                    {STATUS_LABELS[existing.status]}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      {state.error && <p className="mt-2 text-xs text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending} className="mt-2 px-4 py-1.5 text-xs">
        {pending ? "در حال ثبت..." : "ثبت ارجاع‌های انتخاب‌شده"}
      </Button>
    </form>
  );
}
