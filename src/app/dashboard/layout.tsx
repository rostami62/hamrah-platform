import type { Metadata } from "next";

// دفاع در عمق علاوه بر Disallow در robots.ts — پرونده‌های کودکان هرگز نباید ایندکس شوند.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
