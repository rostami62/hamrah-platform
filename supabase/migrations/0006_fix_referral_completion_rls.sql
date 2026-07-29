-- ============================================================
-- رفع باگ: وقتی پزشک/روان‌شناس/معلم گزارش خودشان را ثبت می‌کنند،
-- markReferralCompleted سعی می‌کند ردیف referrals را completed کند،
-- اما policy فعلی فقط به سازنده‌ی ارجاع (مددکار) یا assigned_to_user_id
-- اجازه‌ی update می‌دهد — و assigned_to_user_id هیچ‌جای برنامه پر
-- نمی‌شود. در نتیجه آپدیت بی‌صدا صفر ردیف را تغییر می‌دهد و Badge
-- در داشبورد مددکار هیچ‌وقت سبز نمی‌شود.
-- در SQL Editor پروژه‌ی Supabase اجرا شود.
-- ============================================================

create policy "referrals_update_specialist_on_own_case"
  on public.referrals for update
  using (
    exists (
      select 1 from public.patient_files pf
      where pf.id = case_id
        and (
          (referred_to_role = 'doctor' and pf.doctor_id = auth.uid())
          or (referred_to_role = 'psychologist' and pf.psychologist_id = auth.uid())
          or (referred_to_role = 'teacher' and pf.teacher_id = auth.uid())
        )
    )
  );
