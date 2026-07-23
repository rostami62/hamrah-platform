import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "ثبت‌نام",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-center text-xl font-bold text-primary-900">
        ثبت‌نام (پزشک، معلم یا خیّر)
      </h1>
      <p className="text-center text-sm text-primary-600">
        والدین از طریق لینک خوداظهاری پیامکی و مددکاران/مدیران توسط مدیر
        سیستم به سامانه دسترسی پیدا می‌کنند.
      </p>
      <RegisterForm />
      <p className="text-center text-sm text-primary-600">
        حساب دارید؟{" "}
        <Link href="/login" className="font-medium text-primary-700">
          ورود
        </Link>
      </p>
    </div>
  );
}
