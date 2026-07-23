import type { Roadmap } from "@/types/roadmap";

export function RoadmapResult({ roadmap }: { roadmap: Roadmap }) {
  return (
    <div className="flex flex-col gap-6">
      {roadmap.map((category) => (
        <section key={category.key} className="surface rounded-[var(--radius-card)] p-5">
          <h3 className="mb-3 text-lg font-semibold text-primary-900">
            {category.label}
          </h3>
          <ul className="flex flex-col gap-3">
            {category.recommendations.map((rec) => (
              <li key={rec.title} className="text-sm">
                <p className="font-medium text-primary-800">{rec.title}</p>
                <p className="text-primary-600">{rec.description}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
