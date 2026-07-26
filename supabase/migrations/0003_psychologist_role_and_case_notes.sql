-- ============================================================
-- افزودنی به schema.sql — تفکیک نقش «روان‌شناس/مشاور» از «پزشک»
-- + امکان ثبت گزارش/یادداشت آزاد در کارت پرونده (case_notes)
-- در SQL Editor پروژه‌ی Supabase اجرا شود.
-- ============================================================

-- ۱) افزودن نقش psychologist به profiles.role
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('doctor', 'psychologist', 'social-worker', 'parent', 'teacher', 'donor', 'admin'));

-- روان‌شناس هم مثل پزشک نیاز به تایید هویت ادمین دارد
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, national_id, full_name, verified)
  values (
    new.id,
    new.raw_user_meta_data ->> 'role',
    new.raw_user_meta_data ->> 'national_id',
    new.raw_user_meta_data ->> 'full_name',
    coalesce((new.raw_user_meta_data ->> 'role') not in ('doctor', 'psychologist'), true)
  );
  return new;
end;
$$;

-- ۲) ستون روان‌شناسِ اختصاص‌یافته به پرونده (مستقل از doctor_id)
alter table public.patient_files add column if not exists psychologist_id uuid references public.profiles (id);

drop policy if exists "patient_files_select_related" on public.patient_files;
create policy "patient_files_select_related"
  on public.patient_files for select
  using (
    created_by = auth.uid()
    or parent_id = auth.uid()
    or doctor_id = auth.uid()
    or psychologist_id = auth.uid()
    or teacher_id = auth.uid()
    or public.current_role() = 'admin'
  );

-- ۳) مددکار برای ارجاع، روان‌شناسان تاییدشده را هم ببیند
drop policy if exists "profiles_select_specialists_for_referral" on public.profiles;
create policy "profiles_select_specialists_for_referral"
  on public.profiles for select
  using (
    role in ('doctor', 'psychologist', 'teacher')
    and verified = true
    and public.current_role() = 'social-worker'
  );

-- ۴) یادداشت/گزارش آزاد قابل‌ویرایش هر متخصص برای یک پرونده — یک ردیف
-- به‌ازای هر (پرونده، نقش)، مستقل از گزارش ساختاریافته‌ی خوداظهاری پزشک.
create table if not exists public.case_notes (
  id uuid primary key default gen_random_uuid(),
  patient_file_id uuid not null references public.patient_files (id) on delete cascade,
  role text not null check (role in ('doctor', 'psychologist', 'teacher')),
  author_id uuid not null references public.profiles (id),
  note text not null default '',
  updated_at timestamptz not null default now(),
  unique (patient_file_id, role)
);

alter table public.case_notes enable row level security;

create policy "case_notes_select_related"
  on public.case_notes for select
  using (
    exists (
      select 1 from public.patient_files pf
      where pf.id = patient_file_id
        and (
          pf.created_by = auth.uid()
          or pf.parent_id = auth.uid()
          or pf.doctor_id = auth.uid()
          or pf.psychologist_id = auth.uid()
          or pf.teacher_id = auth.uid()
        )
    )
    or public.current_role() = 'admin'
  );

-- نویسنده فقط می‌تواند یادداشتِ نقشِ خودش را روی پرونده‌ای که به او
-- اختصاص یافته بنویسد/ویرایش کند (نه نقش‌های دیگر را).
create policy "case_notes_insert_assigned_specialist"
  on public.case_notes for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.patient_files pf
      where pf.id = patient_file_id
        and (
          (role = 'doctor' and pf.doctor_id = auth.uid())
          or (role = 'psychologist' and pf.psychologist_id = auth.uid())
          or (role = 'teacher' and pf.teacher_id = auth.uid())
        )
    )
  );

create policy "case_notes_update_assigned_specialist"
  on public.case_notes for update
  using (
    exists (
      select 1 from public.patient_files pf
      where pf.id = patient_file_id
        and (
          (role = 'doctor' and pf.doctor_id = auth.uid())
          or (role = 'psychologist' and pf.psychologist_id = auth.uid())
          or (role = 'teacher' and pf.teacher_id = auth.uid())
        )
    )
  );
