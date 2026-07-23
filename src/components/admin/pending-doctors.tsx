import { verifyDoctorAction } from "@/lib/admin/actions";

interface PendingDoctor {
  id: string;
  full_name: string;
  national_id: string;
}

export function PendingDoctors({ doctors }: { doctors: PendingDoctor[] }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-semibold text-primary-900">
        تایید هویت پزشکان / روان‌شناسان ({doctors.length})
      </h2>
      <div className="flex flex-col gap-2">
        {doctors.length === 0 && (
          <p className="text-sm text-primary-600">موردی در انتظار تایید نیست.</p>
        )}
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="surface flex items-center justify-between rounded-[var(--radius-control)] p-4"
          >
            <span className="text-sm text-primary-800">
              {doctor.full_name} — کد ملی {doctor.national_id}
            </span>
            <form action={verifyDoctorAction.bind(null, doctor.id)}>
              <button
                type="submit"
                className="rounded-[var(--radius-control)] bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
              >
                تایید هویت
              </button>
            </form>
          </div>
        ))}
      </div>
    </section>
  );
}
