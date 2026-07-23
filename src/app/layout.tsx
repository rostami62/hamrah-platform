import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { ServiceWorkerProvider } from "@/components/providers/service-worker-provider";
import "./globals.css";
export const dynamic = 'force-dynamic';

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const title = {
  default: "همراه | پلتفرم پشتیبانی کودکان مبتلا به سرطان",
  template: "%s | همراه",
};
const description =
  "سامانه جامع همراه، پلتفرمی چندنقشی و راست‌چین برای پایش و پشتیبانی روانی-اجتماعی، عاطفی، آموزشی و مالی کودکان مبتلا به سرطان و خانواده‌های آن‌ها.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "همراه",
    title: title.default,
    description,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: title.default,
    description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1c7d76",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="min-h-screen font-sans antialiased">
        {children}
        <ServiceWorkerProvider />
      </body>
    </html>
  );
}
