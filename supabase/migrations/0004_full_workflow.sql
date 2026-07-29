-- ============================================================
-- افزودنی به schema.sql — جریان کاری کامل ارجاع همزمان چهارضلعی
-- (پزشک، روان‌شناس، معلم، خیّر) + فرم‌های تخصصی ساختاریافته.
-- در SQL Editor پروژه‌ی Supabase اجرا شود.
-- ============================================================

-- ۱) وضعیت کلی پرونده و سطح فوریت (مستقل از status موجود که فقط
-- تکمیل خوداظهاری پزشک/والدین را دنبال می‌کند)
alter table public.patient_files
  add column if not exists case_status text not null default 'open'
    check (case_status in ('open', 'under_review', 'completed')),
  add column if not exists urgency text not null default 'medium'
    check (urgency in ('low', 'medium', 'high', 'emergency'));

-- ۲) جدول ارجاعات — یک ردیف به‌ازای هر (پرونده، نقشِ ارجاع‌شده)
create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.patient_files (id) on delete cascade,
  referred_to_role text not null check (referred_to_role in ('doctor', 'psychologist', 'teacher', 'donor')),
  assigned_to_user_id uuid references public.profiles (id),
  status text not null default 'pending' check (status in ('pending', 'completed')),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (case_id, referred_to_role)
);

alter table public.referrals enable row level security;

create policy "referrals_select_related"
  on public.referrals for select
  using (
    created_by = auth.uid()
    or assigned_to_user_id = auth.uid()
    or public.current_role() = 'admin'
  );

create policy "referrals_insert_social_worker"
  on public.referrals for insert
  with check (
    created_by = auth.uid()
    and exists (select 1 from public.patient_files pf where pf.id = case_id and pf.created_by = auth.uid())
  );

create policy "referrals_update_owner_or_assignee"
  on public.referrals for update
  using (
    created_by = auth.uid()
    or assigned_to_user_id = auth.uid()
    or public.current_role() = 'admin'
  );

-- ۳) فرم ساختاریافته‌ی پزشک — یک ردیف در حال تکامل به‌ازای هر پرونده
create table public.medical_reports (
  id uuid primary key default gen_random_uuid(),
  patient_file_id uuid not null unique references public.patient_files (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  diagnosis text,
  medications text,
  treatment_plan text,
  next_visit_date date,
  updated_at timestamptz not null default now()
);

alter table public.medical_reports enable row level security;

create policy "medical_reports_select_related"
  on public.medical_reports for select
  using (
    exists (
      select 1 from public.patient_files pf
      where pf.id = patient_file_id
        and (pf.created_by = auth.uid() or pf.parent_id = auth.uid() or pf.doctor_id = auth.uid())
    )
    or public.current_role() = 'admin'
  );

create policy "medical_reports_insert_assigned_doctor"
  on public.medical_reports for insert
  with check (
    author_id = auth.uid()
    and exists (select 1 from public.patient_files pf where pf.id = patient_file_id and pf.doctor_id = auth.uid())
  );

create policy "medical_reports_update_assigned_doctor"
  on public.medical_reports for update
  using (exists (select 1 from public.patient_files pf where pf.id = patient_file_id and pf.doctor_id = auth.uid()));

-- ۴) فرم ساختاریافته‌ی روان‌شناس
create table public.psychology_reports (
  id uuid primary key default gen_random_uuid(),
  patient_file_id uuid not null unique references public.patient_files (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  behavioral_assessment text,
  therapy_session_notes text,
  mental_status text,
  updated_at timestamptz not null default now()
);

alter table public.psychology_reports enable row level security;

create policy "psychology_reports_select_related"
  on public.psychology_reports for select
  using (
    exists (
      select 1 from public.patient_files pf
      where pf.id = patient_file_id
        and (pf.created_by = auth.uid() or pf.parent_id = auth.uid() or pf.psychologist_id = auth.uid())
    )
    or public.current_role() = 'admin'
  );

create policy "psychology_reports_insert_assigned_psychologist"
  on public.psychology_reports for insert
  with check (
    author_id = auth.uid()
    and exists (select 1 from public.patient_files pf where pf.id = patient_file_id and pf.psychologist_id = auth.uid())
  );

create policy "psychology_reports_update_assigned_psychologist"
  on public.psychology_reports for update
  using (exists (select 1 from public.patient_files pf where pf.id = patient_file_id and pf.psychologist_id = auth.uid()));

-- ۵) فرم ساختاریافته‌ی معلم
create table public.academic_reports (
  id uuid primary key default gen_random_uuid(),
  patient_file_id uuid not null unique references public.patient_files (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  academic_performance text,
  school_behavior text,
  attendance_status text,
  educational_needs text,
  updated_at timestamptz not null default now()
);

alter table public.academic_reports enable row level security;

create policy "academic_reports_select_related"
  on public.academic_reports for select
  using (
    exists (
      select 1 from public.patient_files pf
      where pf.id = patient_file_id
        and (pf.created_by = auth.uid() or pf.parent_id = auth.uid() or pf.teacher_id = auth.uid())
    )
    or public.current_role() = 'admin'
  );

create policy "academic_reports_insert_assigned_teacher"
  on public.academic_reports for insert
  with check (
    author_id = auth.uid()
    and exists (select 1 from public.patient_files pf where pf.id = patient_file_id and pf.teacher_id = auth.uid())
  );

create policy "academic_reports_update_assigned_teacher"
  on public.academic_reports for update
  using (exists (select 1 from public.patient_files pf where pf.id = patient_file_id and pf.teacher_id = auth.uid()));

-- ۶) مدارک/آزمایش‌های بارگذاری‌شده توسط پزشک
create table public.medical_documents (
  id uuid primary key default gen_random_uuid(),
  patient_file_id uuid not null references public.patient_files (id) on delete cascade,
  uploaded_by uuid not null references public.profiles (id),
  file_path text not null,
  file_name text not null,
  created_at timestamptz not null default now()
);

alter table public.medical_documents enable row level security;

create policy "medical_documents_select_related"
  on public.medical_documents for select
  using (
    exists (
      select 1 from public.patient_files pf
      where pf.id = patient_file_id
        and (pf.created_by = auth.uid() or pf.parent_id = auth.uid() or pf.doctor_id = auth.uid())
    )
    or public.current_role() = 'admin'
  );

create policy "medical_documents_insert_assigned_doctor"
  on public.medical_documents for insert
  with check (
    uploaded_by = auth.uid()
    and exists (select 1 from public.patient_files pf where pf.id = patient_file_id and pf.doctor_id = auth.uid())
  );

-- باکت ذخیره‌سازی خصوصی برای مدارک پزشکی؛ مسیر فایل: {patient_file_id}/{نام فایل}
insert into storage.buckets (id, name, public)
values ('medical-documents', 'medical-documents', false)
on conflict (id) do nothing;

create policy "medical_documents_storage_select"
  on storage.objects for select
  using (
    bucket_id = 'medical-documents'
    and exists (
      select 1 from public.patient_files pf
      where pf.id::text = (storage.foldername(name))[1]
        and (pf.created_by = auth.uid() or pf.parent_id = auth.uid() or pf.doctor_id = auth.uid())
    )
  );

create policy "medical_documents_storage_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'medical-documents'
    and exists (
      select 1 from public.patient_files pf
      where pf.id::text = (storage.foldername(name))[1] and pf.doctor_id = auth.uid()
    )
  );

-- ۷) مبلغ موردنیاز/جمع‌آوری‌شده روی درخواست حمایت مالی
alter table public.support_requests
  add column if not exists required_amount numeric,
  add column if not exists raised_amount numeric not null default 0;

-- View خیّرین باید مبالغ را هم شامل شود (باید دوباره ساخته شود چون ستون اضافه شده)
drop view if exists public.donor_visible_requests;
create view public.donor_visible_requests as
  select id, category, description, city, status, required_amount, raised_amount, created_at
  from public.support_requests
  where status = 'approved';

grant select on public.donor_visible_requests to authenticated;
