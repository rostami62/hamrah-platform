"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  badge?: ReactNode;
  content: ReactNode;
}

export function CaseTabs({ tabs }: { tabs: Tab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div>
      <div role="tablist" aria-label="بخش‌های پرونده" className="flex flex-wrap gap-2 border-b border-line pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === active?.id}
            onClick={() => setActiveId(tab.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium",
              tab.id === active?.id
                ? "bg-primary-600 text-white"
                : "text-primary-700 hover:bg-primary-50"
            )}
          >
            {tab.label}
            {tab.badge}
          </button>
        ))}
      </div>
      <div className="mt-4">{active?.content}</div>
    </div>
  );
}
