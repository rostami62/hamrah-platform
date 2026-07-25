-- ============================================================
-- افزودنی به schema.sql — فقط اگر schema.sql پایه را قبلاً اجرا کرده‌اید
-- (وگرنه نیازی به این فایل نیست، در schema.sql اصلی هم اضافه شده است).
-- ============================================================
create policy "profiles_select_specialists_for_referral"
  on public.profiles for select
  using (
    role in ('doctor', 'teacher')
    and verified = true
    and public.current_role() = 'social-worker'
  );
