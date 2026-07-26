-- ============================================================
-- «همراه» — اسکیمای پایه (فاز ۳)
-- در SQL Editor پروژه‌ی Supabase اجرا شود (یک‌بار، به ترتیب از بالا).
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- profiles — یک ردیف به ازای هر کاربر auth.users، شامل نقش
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('doctor', 'psychologist', 'social-worker', 'parent', 'teacher', 'donor', 'admin')),
  national_id text not null unique,
  full_name text not null,
  verified boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- پرونده‌ی الکترونیک کودک
-- ------------------------------------------------------------
create table public.patient_files (
  id uuid primary key default gen_random_uuid(),
  child_national_id text not null,
  child_full_name text not null,
  created_by uuid not null references public.profiles (id),
  parent_id uuid references public.profiles (id),
  doctor_id uuid references public.profiles (id),
  psychologist_id uuid references public.profiles (id),
  teacher_id uuid references public.profiles (id),
  status text not null default 'draft'
    check (status in ('draft', 'awaiting_doctor', 'awaiting_parent', 'active')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- توکن‌های یک‌بارمصرف خوداظهاری (لینک پیامکی پزشک/والدین)
-- insert/update فقط از طریق service-role (ساخت پرونده / تکمیل خوداظهاری)؛
-- select برای مددکارِ سازنده‌ی پرونده مجاز است تا بتواند لینک را دوباره بفرستد.
-- ------------------------------------------------------------
create table public.self_report_tokens (
  token uuid primary key default gen_random_uuid(),
  patient_file_id uuid not null references public.patient_files (id) on delete cascade,
  role text not null check (role in ('doctor', 'parent')),
  phone text not null,
  used boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.doctor_reports (
  id uuid primary key default gen_random_uuid(),
  patient_file_id uuid not null unique references public.patient_files (id) on delete cascade,
  disease_type text not null,
  prognosis text not null,
  treatment_duration text not null check (treatment_duration in ('under-6-months', '6-to-12-months', 'over-12-months')),
  complications text[] not null default '{}',
  notes text,
  submitted_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.parent_reports (
  id uuid primary key default gen_random_uuid(),
  patient_file_id uuid not null unique references public.patient_files (id) on delete cascade,
  education_level text not null,
  parent_job text not null,
  household_income_bracket text not null check (household_income_bracket in ('under-10m', '10m-30m', 'over-30m')),
  school_name text not null,
  created_at timestamptz not null default now()
);

create table public.mental_health_results (
  id uuid primary key default gen_random_uuid(),
  patient_file_id uuid not null references public.patient_files (id) on delete cascade,
  responses jsonb not null,
  total_score int not null,
  max_score int not null,
  band text not null check (band in ('low-concern', 'moderate-concern', 'needs-attention')),
  completed_at timestamptz not null default now()
);

create table public.support_requests (
  id uuid primary key default gen_random_uuid(),
  patient_file_id uuid not null references public.patient_files (id) on delete cascade,
  category text not null check (category in ('medical', 'educational', 'housing', 'other')),
  -- توجه: مددکار نباید نام یا کد ملی کودک را در description بنویسد؛
  -- این فیلد بدون ویرایش برای خیّرین نمایش داده می‌شود (donor_visible_requests).
  description text not null,
  city text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'fulfilled', 'rejected')),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id),
  action text not null,
  target_table text,
  target_id text,
  created_at timestamptz not null default now()
);

-- یادداشت/گزارش آزاد قابل‌ویرایش هر متخصص برای یک پرونده — یک ردیف به‌ازای
-- هر (پرونده، نقش)، مستقل از گزارش ساختاریافته‌ی خوداظهاری پزشک (doctor_reports).
create table public.case_notes (
  id uuid primary key default gen_random_uuid(),
  patient_file_id uuid not null references public.patient_files (id) on delete cascade,
  role text not null check (role in ('doctor', 'psychologist', 'teacher')),
  author_id uuid not null references public.profiles (id),
  note text not null default '',
  updated_at timestamptz not null default now(),
  unique (patient_file_id, role)
);

-- دید غیرشخصی برای داشبورد خیّرین: فقط نیازهای تاییدشده، بدون هیچ داده‌ی
-- شناسایی‌کننده‌ی کودک یا خانواده.
create view public.donor_visible_requests as
  select id, category, description, city, status, created_at
  from public.support_requests
  where status = 'approved';

-- ------------------------------------------------------------
-- تابع کمکی برای خواندن نقش کاربر جاری بدون بازگشت بی‌نهایت در RLS
-- ------------------------------------------------------------
create or replace function public.current_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ------------------------------------------------------------
-- ساخت خودکار profiles هنگام ثبت‌نام (auth.users) — از متادیتای
-- ارسالی در supabase.auth.signUp({ options: { data } }) می‌خواند.
-- ------------------------------------------------------------
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- جلوگیری از ارتقای نقش/تایید هویت توسط خود کاربر (فقط ادمین می‌تواند)
create or replace function public.prevent_self_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_role() <> 'admin' then
    new.role := old.role;
    new.verified := old.verified;
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_privilege_escalation
  before update on public.profiles
  for each row execute function public.prevent_self_privilege_escalation();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.patient_files enable row level security;
alter table public.self_report_tokens enable row level security;
alter table public.doctor_reports enable row level security;
alter table public.parent_reports enable row level security;
alter table public.mental_health_results enable row level security;
alter table public.support_requests enable row level security;
alter table public.audit_logs enable row level security;
alter table public.case_notes enable row level security;

-- profiles: هر کاربر پروفایل خودش را می‌بیند/ویرایش می‌کند؛ ادمین همه را می‌بیند.
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.current_role() = 'admin');

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (id = auth.uid() or public.current_role() = 'admin');

-- مددکار برای ارجاع مستقیم پرونده، باید فهرست متخصصان تاییدشده را ببیند
-- (فقط id/full_name لازم است اما ستون‌های حساس دیگری در profiles نیست)
create policy "profiles_select_specialists_for_referral"
  on public.profiles for select
  using (
    role in ('doctor', 'psychologist', 'teacher')
    and verified = true
    and public.current_role() = 'social-worker'
  );

-- patient_files: مددکارِ سازنده، والد/پزشک/روان‌شناس/معلمِ متصل، یا ادمین
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

create policy "patient_files_insert_social_worker"
  on public.patient_files for insert
  with check (public.current_role() = 'social-worker' and created_by = auth.uid());

create policy "patient_files_update_owner_or_admin"
  on public.patient_files for update
  using (created_by = auth.uid() or public.current_role() = 'admin');

-- self_report_tokens: مددکارِ سازنده‌ی پرونده و ادمین می‌بینند؛ insert/update فقط service-role.
create policy "self_report_tokens_select_owner_or_admin"
  on public.self_report_tokens for select
  using (
    exists (
      select 1 from public.patient_files pf
      where pf.id = patient_file_id and pf.created_by = auth.uid()
    )
    or public.current_role() = 'admin'
  );

-- doctor_reports / parent_reports: مشاهده برای طرف‌های مرتبط با پرونده
create policy "doctor_reports_select_related"
  on public.doctor_reports for select
  using (
    exists (
      select 1 from public.patient_files pf
      where pf.id = patient_file_id
        and (pf.created_by = auth.uid() or pf.parent_id = auth.uid() or pf.doctor_id = auth.uid())
    )
    or public.current_role() = 'admin'
  );

create policy "doctor_reports_update_assigned_doctor"
  on public.doctor_reports for update
  using (
    exists (
      select 1 from public.patient_files pf
      where pf.id = patient_file_id and pf.doctor_id = auth.uid()
    )
  );

create policy "parent_reports_select_related"
  on public.parent_reports for select
  using (
    exists (
      select 1 from public.patient_files pf
      where pf.id = patient_file_id
        and (pf.created_by = auth.uid() or pf.parent_id = auth.uid() or pf.doctor_id = auth.uid())
    )
    or public.current_role() = 'admin'
  );

create policy "parent_reports_update_assigned_parent"
  on public.parent_reports for update
  using (
    exists (
      select 1 from public.patient_files pf
      where pf.id = patient_file_id and pf.parent_id = auth.uid()
    )
  );

-- mental_health_results: فقط والدِ متصل می‌نویسد و طرف‌های مرتبط می‌بینند
create policy "mental_health_select_related"
  on public.mental_health_results for select
  using (
    exists (
      select 1 from public.patient_files pf
      where pf.id = patient_file_id
        and (pf.created_by = auth.uid() or pf.parent_id = auth.uid() or pf.doctor_id = auth.uid())
    )
    or public.current_role() = 'admin'
  );

create policy "mental_health_insert_parent"
  on public.mental_health_results for insert
  with check (
    exists (
      select 1 from public.patient_files pf
      where pf.id = patient_file_id and pf.parent_id = auth.uid()
    )
  );

-- support_requests: مددکارِ سازنده و ادمین کامل می‌بینند؛ خیّرین از View استفاده می‌کنند.
create policy "support_requests_select_owner_or_admin"
  on public.support_requests for select
  using (created_by = auth.uid() or public.current_role() = 'admin');

create policy "support_requests_insert_social_worker"
  on public.support_requests for insert
  with check (public.current_role() = 'social-worker' and created_by = auth.uid());

create policy "support_requests_update_admin"
  on public.support_requests for update
  using (public.current_role() = 'admin');

-- audit_logs: فقط ادمین می‌بیند؛ درج فقط از طریق service-role.
create policy "audit_logs_select_admin"
  on public.audit_logs for select
  using (public.current_role() = 'admin');

-- دسترسی به View برای کاربران احرازهویت‌شده (بدون RLS مستقیم؛ از
-- security_invoker پیروی می‌کند و صرفاً ردیف‌های already-approved را نشان می‌دهد)
grant select on public.donor_visible_requests to authenticated;

-- case_notes: مشاهده برای طرف‌های مرتبط با پرونده؛ نوشتن/ویرایش فقط برای
-- متخصصی که دقیقاً همان نقش را روی همان پرونده دارد (نه نقش‌های دیگر).
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
