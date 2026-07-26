"use client";

import { useActionState } from "react";
import { assignSpecialistAction } from "@/lib/patient-files/referral-actions";
import type { ActionState } from "@/lib/auth/actions";
import type { ReferrableSpecialistRole } from "@/types/roles";

interface Specialist {
  id: string;
  full_name: string;
}

const initialState: ActionState = {};

export function AssignSpecialistForm({
  patientFileId,
  doctors,
  psychologists,
  teachers,
  currentDoctorId,
  currentPsychologistId,
  currentTeacherId,
}: {
  patientFileId: string;
  doctors: Specialist[];
  psychologists: Specialist[];
  teachers: Specialist[];
  currentDoctorId: string | null;
  currentPsychologistId: string | null;
  currentTeacherId: string | null;
}) {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-3">
      <AssignRow
        patientFileId={patientFileId}
        specialistRole="doctor"
        label="ارجاع به پزشک"
        options={doctors}
        currentId={currentDoctorId}
        emptyLabel="پزشک تاییدشده‌ای موجود نیست"
      />
      <AssignRow
        patientFileId={patientFileId}
        specialistRole="psychologist"
        label="ارجاع به روان‌شناس / مشاور"
        options={psychologists}
        currentId={currentPsychologistId}
        emptyLabel="روان‌شناس تاییدشده‌ای موجود نیست"
      />
      <AssignRow
        patientFileId={patientFileId}
        specialistRole="teacher"
        label="ارجاع به معلم / آموزش‌یار"
        options={teachers}
        currentId={currentTeacherId}
        emptyLabel="معلم تاییدشده‌ای موجود نیست"
      />
    </div>
  );
}

function AssignRow({
  patientFileId,
  specialistRole,
  label,
  options,
  currentId,
  emptyLabel,
}: {
  patientFileId: string;
  specialistRole: ReferrableSpecialistRole;
  label: string;
  options: Specialist[];
  currentId: string | null;
  emptyLabel: string;
}) {
  const [state, formAction, pending] = useActionState(assignSpecialistAction, initialState);
  const selectId = `${specialistRole}-${patientFileId}`;
  const current = options.find((o) => o.id === currentId);

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <input type="hidden" name="patientFileId" value={patientFileId} />
      <input type="hidden" name="specialistRole" value={specialistRole} />

      <label htmlFor={selectId} className="text-xs font-medium text-primary-700">
        {label}
      </label>
      <div className="flex gap-2">
        <select
          id={selectId}
          name="profileId"
          defaultValue={currentId ?? ""}
          disabled={options.length === 0}
          className="field-input flex-1 text-xs"
        >
          <option value="" disabled>
            {options.length === 0 ? emptyLabel : "انتخاب کنید"}
          </option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.full_name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending || options.length === 0}
          className="rounded-[var(--radius-control)] bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {pending ? "..." : current ? "تغییر" : "ارجاع"}
        </button>
      </div>

      {state.error && <p className="text-xs text-danger">{state.error}</p>}
      {current && <p className="text-xs text-primary-600">فعلی: {current.full_name}</p>}
    </form>
  );
}
