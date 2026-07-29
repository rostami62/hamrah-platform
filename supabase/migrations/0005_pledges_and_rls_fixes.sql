-- ============================================================
-- افزودنی به schema.sql — قصد مشارکت مالی خیّرین + اصلاح یک باگ RLS
-- (روان‌شناس هرگز به گزارش اولیه پزشک/والدین/غربالگری روان دسترسی
-- نداشت چون آن policyها هنگام افزودن نقش psychologist به‌روزرسانی
-- نشده بودند) + دسترسی متقابل تیم درمانی بین پزشک و روان‌شناس.
-- در SQL Editor پروژه‌ی Supabase اجرا شود.
-- ============================================================

-- ۱) ثبت قصد مشارکت مالی — نه پرداخت واقعی؛ تا اتصال یک درگاه واقعی،
-- مددکار/ادمین با خیّر هماهنگ می‌کنند و بعد از دریافت واقعی، fulfilled می‌کنند.
create table public.donation_pledges (
  id uuid primary key default gen_random_uuid(),
  support_request_id uuid not null references public.support_requests (id) on delete cascade,
  donor_id uuid not null references public.profiles (id),
  amount numeric not null check (amount > 0),
  message text,
  status text not null default 'pledged' check (status in ('pledged', 'fulfilled', 'cancelled')),
  created_at timestamptz not null default now(),
  fulfilled_at timestamptz
);

alter table public.donation_pledges enable row level security;

create policy "donation_pledges_select_related"
  on public.donation_pledges for select
  using (
    donor_id = auth.uid()
    or public.current_role() = 'admin'
    or exists (
      select 1 from public.support_requests sr
      join public.patient_files pf on pf.id = sr.patient_file_id
      where sr.id = support_request_id and pf.created_by = auth.uid()
    )
  );

create policy "donation_pledges_insert_donor"
  on public.donation_pledges for insert
  with check (
    donor_id = auth.uid()
    and public.current_role() = 'donor'
    and exists (select 1 from public.support_requests sr where sr.id = support_request_id and sr.status = 'approved')
  );

create policy "donation_pledges_update_owner_or_staff"
  on public.donation_pledges for update
  using (
    donor_id = auth.uid()
    or public.current_role() = 'admin'
    or exists (
      select 1 from public.support_requests sr
      join public.patient_files pf on pf.id = sr.patient_file_id
      where sr.id = support_request_id and pf.created_by = auth.uid()
    )
  );

-- ۲) رفع باگ: این سه policy هنگام افزودن نقش psychologist به‌روزرسانی
-- نشده بودند؛ روان‌شناس باید بتواند خوداظهاری اولیه پزشک/والدین و
-- نتیجه‌ی غربالگری روان کودکِ ارجاع‌شده به خودش را ببیند.
drop policy if exists "doctor_reports_select_related" on public.doctor_reports;
create policy "doctor_reports_select_related"
  on public.doctor_reports for select
  using (
    exists (
      select 1 from public.patient_files pf
      where pf.id = patient_file_id
        and (pf.created_by = auth.uid() or pf.parent_id = auth.uid() or pf.doctor_id = auth.uid() or pf.psychologist_id = auth.uid())
    )
    or public.current_role() = 'admin'
  );

drop policy if exists "parent_reports_select_related" on public.parent_reports;
create policy "parent_reports_select_related"
  on public.parent_reports for select
  using (
    exists (
      select 1 from public.patient_files pf
      where pf.id = patient_file_id
        and (pf.created_by = auth.uid() or pf.parent_id = auth.uid() or pf.doctor_id = auth.uid() or pf.psychologist_id = auth.uid())
    )
    or public.current_role() = 'admin'
  );

drop policy if exists "mental_health_select_related" on public.mental_health_results;
create policy "mental_health_select_related"
  on public.mental_health_results for select
  using (
    exists (
      select 1 from public.patient_files pf
      where pf.id = patient_file_id
        and (pf.created_by = auth.uid() or pf.parent_id = auth.uid() or pf.doctor_id = auth.uid() or pf.psychologist_id = auth.uid())
    )
    or public.current_role() = 'admin'
  );

-- ۳) دسترسی خواندنِ متقابل تیم درمانی: پزشک و روان‌شناسِ همان پرونده
-- یادداشت ساختاریافته‌ی یکدیگر را ببینند (نه معلم، نه خیّر).
create policy "medical_reports_select_team_psychologist"
  on public.medical_reports for select
  using (exists (select 1 from public.patient_files pf where pf.id = patient_file_id and pf.psychologist_id = auth.uid()));

create policy "psychology_reports_select_team_doctor"
  on public.psychology_reports for select
  using (exists (select 1 from public.patient_files pf where pf.id = patient_file_id and pf.doctor_id = auth.uid()));

-- ۴) مددکار برای هماهنگی دریافت وجه، باید نام خیّری که روی یکی از
-- پرونده‌های خودش قصد مشارکت ثبت کرده را ببیند (وگرنه نمی‌داند با که تماس بگیرد).
create policy "profiles_select_donor_with_pledge_on_own_case"
  on public.profiles for select
  using (
    role = 'donor'
    and exists (
      select 1 from public.donation_pledges dp
      join public.support_requests sr on sr.id = dp.support_request_id
      join public.patient_files pf on pf.id = sr.patient_file_id
      where dp.donor_id = profiles.id and pf.created_by = auth.uid()
    )
  );
