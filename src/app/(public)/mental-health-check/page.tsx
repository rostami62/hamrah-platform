import type { Metadata } from "next";
import { QuestionnaireForm } from "@/components/mental-health/questionnaire-form";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "غربالگری سلامت روان",
  description:
    "چک-این هفتگی غیرتشخیصی برای پایش وضعیت روانی کودک و گفتگوی بهتر با تیم درمانی.",
  alternates: { canonical: "/mental-health-check" },
  openGraph: {
    title: "غربالگری سلامت روان | همراه",
    description:
      "چک-این هفتگی غیرتشخیصی برای پایش وضعیت روانی کودک و گفتگوی بهتر با تیم درمانی.",
  },
};

export default async function MentalHealthCheckPage() {
  const profile = await getCurrentProfile();
  let patientFileId: string | undefined;

  if (profile?.role === "parent") {
    const supabase = await createClient();
    const { data: file } = await supabase
      .from("patient_files")
      .select("id")
      .eq("parent_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    patientFileId = file?.id;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold text-primary-900 sm:text-3xl">
        غربالگری سلامت روان
      </h1>
      <p className="mt-2 text-primary-700">
        این پرسشنامه یک چک-این عمومی و غیرتشخیصی است، نه ابزار بالینی معتبر.
      </p>
      <div className="mt-8">
        <QuestionnaireForm patientFileId={patientFileId} />
      </div>
    </main>
  );
}
