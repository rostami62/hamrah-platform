import type { Metadata } from "next";
import { CardLink } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main>
      <JsonLd data={organizationSchema()} />

      <section className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 py-16 text-center">
        <span className="rounded-full bg-primary-100 px-4 py-1 text-sm font-medium text-primary-700">
          سامانه جامع همراه
        </span>
        <h1 className="text-3xl font-bold text-primary-900 sm:text-4xl">
          همراه خانواده‌ها در مسیر درمان
        </h1>
        <p className="max-w-2xl text-balance text-primary-700">
          پشتیبانی روانی-اجتماعی، عاطفی، آموزشی و مالی کودکان مبتلا به سرطان؛
          نقشه راه اختصاصی، منابع حمایتی و پایش سلامت روان، همه در یک سامانه.
        </p>
      </section>

      <section className="mx-auto grid max-w-4xl gap-4 px-6 pb-16 sm:grid-cols-3">
        <CardLink
          href="/roadmap"
          title="نقشه راه اختصاصی"
          description="با تکمیل اطلاعات کودک، توصیه‌های آموزشی، روانی و مالی متناسب دریافت کنید."
        />
        <CardLink
          href="/resources"
          title="منابع حمایتی"
          description="اقامتگاه‌های نزدیک مراکز درمانی، سازمان‌های مردم‌نهاد و خیریه‌ها."
        />
        <CardLink
          href="/mental-health-check"
          title="غربالگری سلامت روان"
          description="چک-این دوره‌ای برای پایش وضعیت روانی کودک."
        />
      </section>
    </main>
  );
}
