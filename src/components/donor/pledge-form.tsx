"use client";

import { useActionState, useState } from "react";
import { createPledgeAction } from "@/lib/donor/pledge-actions";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/auth/actions";

interface State extends ActionState {
  success?: boolean;
}

const initialState: State = {};

export function PledgeForm({ supportRequestId }: { supportRequestId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<State, FormData>(async (prev, formData) => {
    const result = await createPledgeAction(prev, formData);
    return result.error ? result : { success: true };
  }, initialState);

  if (state.success) {
    return (
      <p className="text-xs text-primary-700">
        قصد مشارکت شما ثبت شد — مددکار اجتماعی برای هماهنگی نحوه‌ی پرداخت با شما تماس می‌گیرد.
      </p>
    );
  }

  if (!open) {
    return (
      <Button type="button" variant="accent" onClick={() => setOpen(true)} className="px-4 py-1.5 text-xs">
        مشارکت در حمایت مالی
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-[var(--radius-control)] border border-line p-3">
      <input type="hidden" name="supportRequestId" value={supportRequestId} />
      <label className="text-xs font-medium text-primary-700">
        مبلغ (تومان)
        <input name="amount" type="number" min={1} required className="field-input mt-1" />
      </label>
      <label className="text-xs font-medium text-primary-700">
        پیام برای خانواده (اختیاری)
        <textarea name="message" rows={2} className="field-input mt-1" />
      </label>
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className="px-4 py-1.5 text-xs">
          {pending ? "در حال ثبت..." : "ثبت قصد مشارکت"}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-[var(--radius-control)] px-3 py-1.5 text-xs text-primary-600 hover:bg-primary-50"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}
