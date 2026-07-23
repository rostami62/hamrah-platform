"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ResourceCard } from "./resource-card";
import type { ResourceCategory, SupportResource } from "@/types/resource";

const TABS: { value: ResourceCategory | "all"; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "accommodation", label: "اقامتگاه‌ها" },
  { value: "ngo", label: "سازمان‌های مردم‌نهاد" },
  { value: "charity", label: "خیریه‌ها" },
];

export function ResourceDirectory({
  resources,
}: {
  resources: SupportResource[];
}) {
  const [active, setActive] = useState<ResourceCategory | "all">("all");

  const visible =
    active === "all" ? resources : resources.filter((r) => r.category === active);

  return (
    <div>
      <div
        role="tablist"
        aria-label="فیلتر دسته‌بندی منابع"
        className="flex flex-wrap gap-2"
      >
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active === tab.value}
            onClick={() => setActive(tab.value)}
            className={cn(
              "rounded-[var(--radius-control)] border px-4 py-2 text-sm font-medium transition-colors",
              active === tab.value
                ? "border-primary-600 bg-primary-600 text-white"
                : "border-line bg-surface text-primary-700 hover:bg-primary-50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}
