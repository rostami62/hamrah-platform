import type { Metadata } from "next";
import { RoadmapGenerator } from "@/components/roadmap/roadmap-generator";
import { JsonLd } from "@/components/seo/json-ld";
import { medicalConditionSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "نقشه راه اختصاصی",
  description:
    "با تکمیل اطلاعات اولیه کودک، توصیه‌های آموزشی، روانی و مالی اختصاصی دریافت کنید.",
  alternates: { canonical: "/roadmap" },
  openGraph: {
    title: "نقشه راه اختصاصی | همراه",
    description:
      "با تکمیل اطلاعات اولیه کودک، توصیه‌های آموزشی، روانی و مالی اختصاصی دریافت کنید.",
  },
};

export default function RoadmapPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <JsonLd data={medicalConditionSchema()} />

      <h1 className="text-2xl font-bold text-primary-900 sm:text-3xl">
        نقشه راه اختصاصی
      </h1>
      <p className="mt-2 max-w-2xl text-primary-700">
        با تکمیل اطلاعات زیر، فهرستی از توصیه‌های آموزشی، روانی و مالی
        متناسب با شرایط کودک دریافت می‌کنید. این توصیه‌ها جایگزین نظر تیم
        درمانی نیست و به‌صورت آفلاین روی همین دستگاه ذخیره می‌شود.
      </p>
      <div className="mt-8">
        <RoadmapGenerator />
      </div>
    </main>
  );
}
