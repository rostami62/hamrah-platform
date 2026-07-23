import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/** کلاینت Supabase برای کامپوننت‌های کلاینتی (RLS با نشست کاربر اعمال می‌شود). */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
