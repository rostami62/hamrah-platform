import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { NewFileForm } from "@/components/social-worker/new-file-form";
import { SupportRequestForm } from "@/components/social-worker/support-request-form";
import { AssignSpecialistForm } from "@/components/social-worker/assign-specialist-form";
import { MultiReferralForm } from "@/components/social-worker/multi-referral-form";

const STATUS_LABELS: Record<string, string> = {
  draft: "در انتظار ارسال",
  awaiting_doctor: "در انتظار خوداظهاری پزشک",
  awaiting_parent: "در انتظار خوداظهاری والدین",
  active: "تکمیل و فعال",
};

const URGENCY_LABELS: Record<string, string> = {
  low: "کم",
  medium: "متوسط",
  high: "بالا",
  emergency: "اورژانسی",
};
const URGENCY_COLORS: Record<string, string> = {
  low: "bg-primary-50 text-primary-700",
  medium: "bg-accent-50 text-accent-700",
  high: "bg-danger/10 text-danger",
  emergency: "bg-danger/20 text-danger",
};

export default async function SocialWorkerDashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [{ data: files }, { data: doctors }, { data: psychologists }, { data: teachers }] = await Promise.all([
    supabase
      .from("patient_files")
      .select("id, child_full_name, status, urgency, doctor_id, psychologist_id, teacher_id, created_at")
      .eq("created_by", profile!.id)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name").eq("role", "doctor").eq("verified", true),
    supabase.from("profiles").select("id, full_name").eq("role", "psychologist").eq("verified", true),
    supabase.from("profiles").select("id, full_name").eq("role", "teacher").eq("verified", true),
  ]);

  const fileIds = (files ?? []).map((f) => f.id);
  const [{ data: pendingTokens }, { data: referrals }] = await Promise.all([
    fileIds.length
      ? supabase.from("self_report_tokens").select("patient_file_id, role, token, used").in("patient_file_id", fileIds).eq("used", false)
      : Promise.resolve({ data: [] as { patient_file_id: string; role: string; token: string; used: boolean }[] }),
    fileIds.length
      ? supabase.from("referrals").select("case_id, referred_to_role, status").in("case_id", fileIds)
      : Promise.resolve({ data: [] as { case_id: string; referred_to_role: "doctor" | "psychologist" | "teacher" | "donor"; status: "pending" | "completed" }[] }),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold text-primary-900">داشبورد مددکار اجتماعی</h1>
      <p className="mt-2 text-primary-700">
        خوش آمدید، {profile?.full_name}. پرونده‌های ثبت‌شده توسط شما:
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="flex flex-col gap-3">
          {(files ?? []).length === 0 && (
            <p className="text-sm text-primary-600">هنوز پرونده‌ای ثبت نکرده‌اید.</p>
          )}
          {(files ?? []).map((file) => {
            const links = (pendingTokens ?? []).filter((t) => t.patient_file_id === file.id);
            const fileReferrals = (referrals ?? []).filter((r) => r.case_id === file.id);
            return (
              <article key={file.id} className="surface rounded-[var(--radius-card)] p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-primary-900">{file.child_full_name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${URGENCY_COLORS[file.urgency] ?? ""}`}>
                      فوریت: {URGENCY_LABELS[file.urgency] ?? file.urgency}
                    </span>
                    <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                      {STATUS_LABELS[file.status] ?? file.status}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/dashboard/social-worker/cases/${file.id}`}
                  className="mt-2 inline-block text-xs font-medium text-primary-700 hover:underline"
                >
                  مشاهده‌ی کامل پرونده (نمای ۳۶۰ درجه) ←
                </Link>

                <MultiReferralForm patientFileId={file.id} existingReferrals={fileReferrals} />

                <AssignSpecialistForm
                  patientFileId={file.id}
                  doctors={doctors ?? []}
                  psychologists={psychologists ?? []}
                  teachers={teachers ?? []}
                  currentDoctorId={file.doctor_id}
                  currentPsychologistId={file.psychologist_id}
                  currentTeacherId={file.teacher_id}
                />

                {links.length > 0 && (
                  <ul className="mt-3 flex flex-col gap-1 text-xs text-primary-600">
                    {links.map((t) => (
                      <li key={t.token}>
                        لینک خوداظهاری {t.role === "doctor" ? "پزشک" : "والدین"} هنوز تکمیل
                        نشده — «دکمه ارسال مجدد پیامک» در نسخه‌ی بعد به این ردیف اضافه می‌شود.
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            );
          })}
        </section>

        <div className="flex flex-col gap-6">
          <NewFileForm />
          <SupportRequestForm files={files ?? []} />
        </div>
      </div>
    </main>
  );
}
