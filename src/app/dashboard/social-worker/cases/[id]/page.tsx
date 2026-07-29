import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service-client";
import { getCurrentProfile } from "@/lib/auth/session";
import { CaseStatusForm } from "@/components/social-worker/case-status-form";
import { CaseTabs } from "@/components/social-worker/case-tabs";
import { markPledgeFulfilledAction } from "@/lib/donor/pledge-actions";
import {
  DISEASE_TYPE_OPTIONS,
  PROGNOSIS_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
} from "@/lib/roadmap/options";

const REFERRAL_ROLE_LABELS: Record<string, string> = {
  doctor: "پزشک",
  psychologist: "روان‌شناس / مشاور",
  teacher: "معلم",
  donor: "خیّرین",
};

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: file } = await supabase
    .from("patient_files")
    .select("*")
    .eq("id", id)
    .eq("created_by", profile!.id)
    .maybeSingle();

  if (!file) notFound();

  const [
    { data: referrals },
    { data: doctorReport },
    { data: medicalReport },
    { data: medicalDocuments },
    { data: psychologyReport },
    { data: mentalHealthResults },
    { data: academicReport },
    { data: parentReport },
    { data: supportRequests },
  ] = await Promise.all([
    supabase.from("referrals").select("referred_to_role, status, completed_at").eq("case_id", id),
    supabase.from("doctor_reports").select("*").eq("patient_file_id", id).maybeSingle(),
    supabase.from("medical_reports").select("*").eq("patient_file_id", id).maybeSingle(),
    supabase.from("medical_documents").select("*").eq("patient_file_id", id).order("created_at", { ascending: false }),
    supabase.from("psychology_reports").select("*").eq("patient_file_id", id).maybeSingle(),
    supabase.from("mental_health_results").select("*").eq("patient_file_id", id).order("completed_at", { ascending: false }),
    supabase.from("academic_reports").select("*").eq("patient_file_id", id).maybeSingle(),
    supabase.from("parent_reports").select("*").eq("patient_file_id", id).maybeSingle(),
    supabase.from("support_requests").select("*").eq("patient_file_id", id).order("created_at", { ascending: false }),
  ]);

  const referralByRole = new Map((referrals ?? []).map((r) => [r.referred_to_role, r]));

  // خواندن با service client: مالکیتِ پرونده همین بالا (notFound در صورت
  // عدم تطابق created_by) احراز شده؛ RLS چندجدولیِ donation_pledges/profiles
  // برای این مسیر جواب نمی‌دهد.
  const service = createServiceClient();

  const requestIds = (supportRequests ?? []).map((r) => r.id);
  const { data: pledges } = requestIds.length
    ? await service
        .from("donation_pledges")
        .select("id, support_request_id, donor_id, amount, message, status, created_at")
        .in("support_request_id", requestIds)
        .order("created_at", { ascending: false })
    : { data: [] as { id: string; support_request_id: string; donor_id: string; amount: number; message: string | null; status: string; created_at: string }[] };

  const donorIds = [...new Set((pledges ?? []).map((p) => p.donor_id))];
  const { data: donorProfiles } = donorIds.length
    ? await service.from("profiles").select("id, full_name").in("id", donorIds)
    : { data: [] as { id: string; full_name: string }[] };
  const donorNameById = new Map((donorProfiles ?? []).map((d) => [d.id, d.full_name]));

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold text-primary-900">{file.child_full_name}</h1>
      <p className="mt-1 text-sm text-primary-600">کد ملی کودک: {file.child_national_id}</p>

      <div className="surface mt-4 rounded-[var(--radius-card)] p-4">
        <CaseStatusForm patientFileId={file.id} caseStatus={file.case_status} urgency={file.urgency} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["doctor", "psychologist", "teacher", "donor"] as const).map((role) => {
          const referral = referralByRole.get(role);
          return (
            <span
              key={role}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                referral?.status === "completed"
                  ? "bg-primary-100 text-primary-700"
                  : referral
                    ? "bg-accent-50 text-accent-700"
                    : "bg-surface-2 text-primary-500"
              }`}
            >
              {REFERRAL_ROLE_LABELS[role]}:{" "}
              {referral ? (referral.status === "completed" ? "تکمیل‌شده" : "در انتظار") : "ارجاع نشده"}
            </span>
          );
        })}
      </div>

      <div className="mt-8">
        <CaseTabs
          tabs={[
            {
              id: "summary",
              label: "خلاصه",
              content: (
                <div className="surface flex flex-col gap-3 rounded-[var(--radius-card)] p-5 text-sm">
                  {parentReport ? (
                    <>
                      <p>
                        <span className="font-medium text-primary-800">مقطع تحصیلی: </span>
                        {EDUCATION_LEVEL_OPTIONS[parentReport.education_level as keyof typeof EDUCATION_LEVEL_OPTIONS] ?? parentReport.education_level}
                      </p>
                      <p>
                        <span className="font-medium text-primary-800">شغل والد: </span>
                        {parentReport.parent_job}
                      </p>
                      <p>
                        <span className="font-medium text-primary-800">مدرسه: </span>
                        {parentReport.school_name}
                      </p>
                    </>
                  ) : (
                    <p className="text-primary-600">اطلاعات خوداظهاری والدین هنوز ثبت نشده است.</p>
                  )}
                  {(mentalHealthResults ?? []).length > 0 && (
                    <p className="text-primary-600">
                      آخرین چک-این سلامت روان: {(mentalHealthResults ?? [])[0]!.band} (
                      {new Date((mentalHealthResults ?? [])[0]!.completed_at).toLocaleDateString("fa-IR")})
                    </p>
                  )}
                </div>
              ),
            },
            {
              id: "medical",
              label: "گزارش پزشکی",
              content: (
                <div className="surface flex flex-col gap-4 rounded-[var(--radius-card)] p-5 text-sm">
                  {doctorReport && (
                    <div>
                      <p className="mb-1 text-xs font-semibold text-primary-600">خوداظهاری اولیه پزشک</p>
                      <p>
                        {DISEASE_TYPE_OPTIONS[doctorReport.disease_type as keyof typeof DISEASE_TYPE_OPTIONS] ?? doctorReport.disease_type}
                        {" — "}
                        {PROGNOSIS_OPTIONS[doctorReport.prognosis as keyof typeof PROGNOSIS_OPTIONS] ?? doctorReport.prognosis}
                      </p>
                    </div>
                  )}
                  {medicalReport ? (
                    <div>
                      <p className="mb-1 text-xs font-semibold text-primary-600">گزارش درمانی جاری</p>
                      <p><span className="font-medium">تشخیص: </span>{medicalReport.diagnosis || "—"}</p>
                      <p><span className="font-medium">داروها: </span>{medicalReport.medications || "—"}</p>
                      <p><span className="font-medium">برنامه‌ی درمان: </span>{medicalReport.treatment_plan || "—"}</p>
                      <p>
                        <span className="font-medium">ویزیت بعدی: </span>
                        {medicalReport.next_visit_date
                          ? new Date(medicalReport.next_visit_date).toLocaleDateString("fa-IR")
                          : "—"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-primary-600">پزشک هنوز گزارش درمانی ثبت نکرده است.</p>
                  )}
                  {(medicalDocuments ?? []).length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-semibold text-primary-600">مدارک/آزمایش‌ها</p>
                      <ul className="list-inside list-disc text-primary-700">
                        {medicalDocuments!.map((doc) => (
                          <li key={doc.id}>{doc.file_name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ),
            },
            {
              id: "psychology",
              label: "گزارش روان‌شناسی",
              content: (
                <div className="surface flex flex-col gap-2 rounded-[var(--radius-card)] p-5 text-sm">
                  {psychologyReport ? (
                    <>
                      <p><span className="font-medium">ارزیابی رفتاری: </span>{psychologyReport.behavioral_assessment || "—"}</p>
                      <p><span className="font-medium">خلاصه جلسات: </span>{psychologyReport.therapy_session_notes || "—"}</p>
                      <p><span className="font-medium">وضعیت روانی: </span>{psychologyReport.mental_status || "—"}</p>
                    </>
                  ) : (
                    <p className="text-primary-600">روان‌شناس هنوز ارزیابی ثبت نکرده است.</p>
                  )}
                </div>
              ),
            },
            {
              id: "academic",
              label: "گزارش تحصیلی",
              content: (
                <div className="surface flex flex-col gap-2 rounded-[var(--radius-card)] p-5 text-sm">
                  {academicReport ? (
                    <>
                      <p><span className="font-medium">عملکرد تحصیلی: </span>{academicReport.academic_performance || "—"}</p>
                      <p><span className="font-medium">رفتار در مدرسه: </span>{academicReport.school_behavior || "—"}</p>
                      <p><span className="font-medium">وضعیت حضور: </span>{academicReport.attendance_status || "—"}</p>
                      <p><span className="font-medium">نیازهای آموزشی: </span>{academicReport.educational_needs || "—"}</p>
                    </>
                  ) : (
                    <p className="text-primary-600">معلم هنوز ارزیابی ثبت نکرده است.</p>
                  )}
                </div>
              ),
            },
            {
              id: "financial",
              label: "حمایت مالی",
              content: (
                <div className="flex flex-col gap-2">
                  {(supportRequests ?? []).length === 0 && (
                    <p className="surface rounded-[var(--radius-card)] p-5 text-sm text-primary-600">
                      هنوز درخواست حمایت مالی برای این پرونده ثبت نشده است.
                    </p>
                  )}
                  {(supportRequests ?? []).map((req) => {
                    const requestPledges = (pledges ?? []).filter((p) => p.support_request_id === req.id);
                    return (
                      <div key={req.id} className="surface rounded-[var(--radius-card)] p-4 text-sm">
                        <p className="font-medium text-primary-900">{req.description}</p>
                        <p className="mt-1 text-primary-600">
                          وضعیت: {req.status} — نیاز: {req.required_amount ?? "—"} — جمع‌آوری‌شده: {req.raised_amount}
                        </p>
                        {requestPledges.length > 0 && (
                          <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
                            <p className="text-xs font-semibold text-primary-600">قصدهای مشارکت</p>
                            {requestPledges.map((p) => (
                              <div key={p.id} className="flex items-center justify-between gap-2 text-xs">
                                <span>
                                  {donorNameById.get(p.donor_id) ?? "خیّر"} — {p.amount.toLocaleString("fa-IR")} تومان
                                  {p.message && <span className="text-primary-500"> ({p.message})</span>}
                                </span>
                                {p.status === "fulfilled" ? (
                                  <span className="text-primary-600">دریافت‌شده</span>
                                ) : (
                                  <form action={markPledgeFulfilledAction.bind(null, p.id)}>
                                    <button
                                      type="submit"
                                      className="rounded-[var(--radius-control)] bg-primary-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-primary-700"
                                    >
                                      علامت‌گذاری دریافت‌شده
                                    </button>
                                  </form>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ),
            },
          ]}
        />
      </div>
    </main>
  );
}
