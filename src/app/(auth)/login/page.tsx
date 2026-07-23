import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "ورود",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-center text-xl font-bold text-primary-900">ورود</h1>
      <LoginForm />
      <p className="text-center text-sm text-primary-600">
        حساب ندارید؟{" "}
        <Link href="/register" className="font-medium text-primary-700">
          ثبت‌نام
        </Link>
      </p>
    </div>
  );
}
