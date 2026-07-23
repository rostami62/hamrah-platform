import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * کلاینت Supabase برای Server Component/Action ها — نشست کاربر را از
 * کوکی می‌خواند و RLS بر اساس همان کاربر اعمال می‌شود. برای عملیات
 * ممتاز (bypass RLS) از service-client.ts استفاده کنید، نه این فایل.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // در Server Component (نه Server Action) نمی‌توان کوکی نوشت؛
            // چون middleware نشست را تازه نگه می‌دارد، بی‌خطر نادیده گرفته می‌شود.
          }
        },
      },
    }
  );
}
