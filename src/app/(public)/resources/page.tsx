import type { Metadata } from "next";
import { ResourceDirectory } from "@/components/resources/resource-directory";
import { SAMPLE_RESOURCES } from "@/lib/data/resources";
import { JsonLd } from "@/components/seo/json-ld";
import { resourceListSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "منابع حمایتی",
  description:
    "فهرست اقامتگاه‌های نزدیک مراکز درمانی، سازمان‌های مردم‌نهاد و خیریه‌های همکار.",
  alternates: { canonical: "/resources" },
  openGraph: {
    title: "منابع حمایتی | همراه",
    description:
      "فهرست اقامتگاه‌های نزدیک مراکز درمانی، سازمان‌های مردم‌نهاد و خیریه‌های همکار.",
  },
};

export default function ResourcesPage() {
  // داده‌های نمونه عمداً از JSON-LD حذف می‌شوند تا موتور جستجو سازمان‌های
  // ساختگی را به‌عنوان داده‌ی ساخت‌یافته‌ی واقعی ایندکس نکند؛ با جایگزینی
  // داده‌ی واقعی در فاز بعد، این فهرست خودکار پر می‌شود.
  const realResources = SAMPLE_RESOURCES.filter((r) => !r.isSampleData);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      {realResources.length > 0 && <JsonLd data={resourceListSchema(realResources)} />}

      <h1 className="text-2xl font-bold text-primary-900 sm:text-3xl">
        اقامتگاه‌ها، سازمان‌های مردم‌نهاد و خیریه‌ها
      </h1>
      <p className="mt-2 max-w-2xl text-primary-700">
        این فهرست فعلاً داده‌ی نمونه است و برای نمایش رفتار سامانه ساخته
        شده؛ اطلاعات واقعی و تاییدشده توسط مددکاران اجتماعی در پنل مدیریت
        (فاز ۳) ثبت خواهد شد.
      </p>
      <div className="mt-8">
        <ResourceDirectory resources={SAMPLE_RESOURCES} />
      </div>
    </main>
  );
}
