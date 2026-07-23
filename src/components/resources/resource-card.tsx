import type { SupportResource } from "@/types/resource";

const CATEGORY_LABELS: Record<SupportResource["category"], string> = {
  accommodation: "اقامتگاه",
  ngo: "سازمان مردم‌نهاد",
  charity: "خیریه",
};

export function ResourceCard({ resource }: { resource: SupportResource }) {
  return (
    <article className="surface flex flex-col gap-2 rounded-[var(--radius-card)] p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
          {CATEGORY_LABELS[resource.category]}
        </span>
        {resource.isSampleData && (
          <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-medium text-accent-700">
            داده نمونه
          </span>
        )}
      </div>

      <h3 className="text-base font-semibold text-primary-900">
        {resource.name}
      </h3>
      <p className="text-sm text-primary-600">{resource.description}</p>

      <dl className="mt-2 flex flex-col gap-1 text-xs text-primary-700">
        <div className="flex gap-1">
          <dt className="font-medium">شهر:</dt>
          <dd>{resource.city}</dd>
        </div>
        {resource.nearHospital && (
          <div className="flex gap-1">
            <dt className="font-medium">نزدیک به:</dt>
            <dd>{resource.nearHospital}</dd>
          </div>
        )}
        <div className="flex gap-1">
          <dt className="font-medium">شرایط دسترسی:</dt>
          <dd>{resource.accessNotes}</dd>
        </div>
      </dl>
    </article>
  );
}
