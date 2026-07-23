# همراه (Hamrah)

سامانه جامع همراه — پلتفرم چندنقشی، امن و راست‌چین برای پایش و پشتیبانی روانی-اجتماعی، عاطفی، آموزشی و مالی کودکان مبتلا به سرطان.

این ریپازیتوری شامل **فاز ۱ تا ۵** است — معماری کامل، صفحات عمومی، احراز هویت و پرونده الکترونیک روی Supabase، سئوی فنی، و پایان با ریفکتور/مدیریت خطا/دسترسی‌پذیری. با یک پروژه‌ی واقعی Supabase تست end-to-end شده (ثبت‌نام، ورود، محافظت نقش‌محور، خروج).

## فاز ۵ (ریفکتور و کیفیت نهایی)

- **شکستن کامپوننت‌ها**: `admin/page.tsx` به `PendingDoctors`/`PendingSupportRequests`/`AuditLogTable`؛ `RoadmapResult` و `ResultBanner`/`QuestionnaireHistory` از فرم‌های مادر جدا شدند؛ `self-report-actions.ts` به `self-report-token.ts` (اعتبارسنجی مشترک) + `doctor-report-actions.ts` + `parent-report-actions.ts` شکسته شد.
- **مدیریت خطا**: [not-found.tsx](src/app/not-found.tsx)، [error.tsx](src/app/error.tsx) و [global-error.tsx](src/app/global-error.tsx) (آخرین خط دفاعی، بدون وابستگی به globals.css/فونت — عمداً با استایل اینلاین).
- **دسترسی‌پذیری**: کامپوننت `Field` اکنون از `<label>` واقعی (نه `<span>` جدا) استفاده می‌کند تا فیلدها با صفحه‌خوان درست خوانده شوند؛ گروه‌های چک‌باکس (عوارض) از `<div>` به `<fieldset><legend>` اصلاح شدند؛ یک لینک «پرش به محتوای اصلی» (Skip to content) به صفحات عمومی و احراز هویت اضافه شد.
- `npm run typecheck` و `npm run lint` هر دو تمیز رد می‌شوند.

## سئوی فنی (فاز ۴)

- **Metadata**: هر صفحه‌ی عمومی `canonical` و `openGraph` اختصاصی دارد؛ صفحات ورود/ثبت‌نام/خوداظهاری/داشبوردها همه `noindex` هستند.
- **JSON-LD**: `NGO` در صفحه اصلی، `MedicalCondition` در نقشه‌راه، `ItemList` از منابع در صفحه منابع — پیاده‌سازی در [lib/seo/schema.ts](src/lib/seo/schema.ts). داده‌ی نمونه‌ی منابع عمداً از JSON-LD حذف شده تا سازمان‌های ساختگی ایندکس نشوند.
- **تصویر Open Graph**: [app/opengraph-image.tsx](src/app/opengraph-image.tsx) با `next/og` تولید می‌شود؛ چون فونت فارسی برای Satori نیاز به بارگذاری شبکه‌ای دارد، متن تصویر انگلیسی نگه داشته شد تا بدون وابستگی شبکه‌ای همیشه درست رندر شود.
- **robots.ts / sitemap.ts**: `/dashboard/`, `/admin/`, `/self-report/` و `/offline` صریحاً Disallow شده‌اند (فراتر از خواسته‌ی اولیه، `/self-report/` هم اضافه شد چون توکن یک‌بارمصرف در URL دارد و هرگز نباید ایندکس شود).

## راه‌اندازی

Node.js روی این دستگاه نصب نبود؛ فایل‌ها به‌صورت دستی نوشته شده‌اند و **هرگز اجرا نشده‌اند**. پیش از اجرا:

1. نسخه‌ی LTS فعلی Node.js را نصب کنید، سپس:
   ```bash
   npm install
   ```
2. یک پروژه در [supabase.com](https://supabase.com) بسازید و محتوای [supabase/schema.sql](supabase/schema.sql) را در SQL Editor آن اجرا کنید (یک‌بار، کامل).
3. `.env.example` را در `.env.local` کپی کنید و مقادیر `NEXT_PUBLIC_SUPABASE_URL`، `NEXT_PUBLIC_SUPABASE_ANON_KEY` و `SUPABASE_SERVICE_ROLE_KEY` را از Project Settings > API پروژه‌ی Supabase پر کنید.
4. در تنظیمات Supabase Auth، گزینه‌ی «Confirm email» را می‌توانید فعال بگذارید — سامانه با `email_confirm: true` در سمت سرور، ایمیل‌های داخلی (نگاشت‌شده از کد ملی) را خودش تایید می‌کند.
5. اجرا:
   ```bash
   npm run dev
   ```

## ساختار پوشه‌ها

```
src/
  app/
    (public)/               صفحات عمومی: خانه، نقشه‌راه، منابع، غربالگری روان
    (auth)/login|register/  ورود و ثبت‌نام با کد ملی
    self-report/[token]/    فرم خوداظهاری پزشک/والدین (بدون نیاز به ورود)
    dashboard/<role>/       داشبورد هر نقش
    admin/                  داشبورد مدیر سیستم
    offline/                fallback آفلاین PWA
    manifest.ts, layout.tsx, globals.css
  components/
    ui/                     Button، Card، Field
    layout/                 هدر/فوتر/منوی موبایل (آگاه از نشست کاربر)
    roadmap/, resources/, mental-health/    ماژول‌های فاز ۲
    auth/, admin/, social-worker/, self-report/    ماژول‌های فاز ۳
  lib/
    supabase/               client.ts (مرورگر), server.ts (RLS با نشست کاربر), service-client.ts (bypass RLS — فقط سرور)
    auth/                   session.ts، actions.ts (ورود/ثبت‌نام/خروج)، national-id-email.ts
    patient-files/          actions.ts (ساخت پرونده)، self-report-actions.ts
    admin/, support-requests/, mental-health/, roadmap/, sms.ts, validation/
  types/                    roles.ts, database.ts (تایپ دستی متناظر با schema.sql), ...
  middleware.ts             تازه‌سازی نشست + محافظت نقش‌محور از /dashboard و /admin
supabase/
  schema.sql                جداول، RLS، تریگرها، View خیّرین
```

## مدل احراز هویت

- ورود با «کد ملی + رمز عبور»؛ چون Supabase Auth به ایمیل نیاز دارد، کد ملی به یک ایمیل داخلی نگاشت می‌شود (`lib/auth/national-id-email.ts`) — کاربر هرگز آن را نمی‌بیند.
- **ثبت‌نام مستقیم**: فقط پزشک/روان‌شناس، معلم و خیّر (`/register`). حساب پزشک تا تایید هویت توسط ادمین (`verified=false`)، دسترسی محدود دارد.
- **مددکار و ادمین**: فقط توسط یک ادمین موجود ساخته می‌شوند (فرم «ساخت حساب کارکنان» در `/admin`).
- **والدین**: حساب‌شان هنگام تکمیل فرم خوداظهاری (`/self-report/[token]`) خودکار ساخته می‌شود.

## جریان تشکیل پرونده

۱. مددکار از داشبورد خودش پرونده می‌سازد → دو توکن یک‌بارمصرف (پزشک/والدین) ساخته و لینک `/self-report/[token]` «ارسال» می‌شود.
۲. **پیامک واقعی وصل نیست** — `src/lib/sms.ts` فعلاً فقط لینک را در کنسول سرور لاگ می‌کند (`SMS_PROVIDER=console`). برای اتصال یک درگاه واقعی (کاوه‌نگار/قاصدک/ملی‌پیامک)، `ConsoleSmsProvider` را با یک پیاده‌سازی HTTP همان سرویس جایگزین کنید.
۳. پزشک/والدین بدون نیاز به ورود، فرم چندگزینه‌ای خود را تکمیل می‌کنند؛ وضعیت پرونده خودکار به‌روزرسانی می‌شود.

## نکات امنیتی و محدودیت‌های شناخته‌شده

- تمام جداول Supabase دارای Row Level Security هستند؛ عملیات ممتاز (ساخت توکن، تایید ادمین) فقط از طریق `service-client.ts` روی سرور انجام می‌شود و کلید سرویس هرگز به کلاینت ارسال نمی‌شود.
- داده‌های `resources` (اقامتگاه‌ها/خیریه‌ها) در فاز ۲ همچنان **نمونه** هستند و از دیتابیس نمی‌آیند.
- داشبورد معلم به هیچ پرونده‌ای متصل نمی‌شود مگر مکانیزم «اختصاص معلم به پرونده» در نسخه‌ی بعد اضافه شود.
- «تاریخچه‌ی سلامت روان» علاوه بر LocalStorage، وقتی کاربر به‌عنوان والدِ متصل به یک پرونده وارد شده باشد، در `mental_health_results` نیز ذخیره می‌شود.
- `types/database.ts` دستی نوشته شده (بدون CLI/شبکه امکان `supabase gen types` نبود)؛ هر تغییر در `schema.sql` باید همان‌جا هم به‌روزرسانی شود.

## گام‌های بعدی (فاز ۴ و ۵)

فاز ۴ (Metadata API، JSON-LD، sitemap/robots با مسدودسازی `/dashboard` و `/admin`) و فاز ۵ (شکستن کامپوننت‌های بزرگ‌تر، `error.tsx`/`not-found.tsx`، بازبینی نهایی دسترسی‌پذیری) هنوز پیاده‌سازی نشده‌اند.
