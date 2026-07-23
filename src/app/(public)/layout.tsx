import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SkipToContent } from "@/components/layout/skip-to-content";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipToContent />
      <SiteHeader />
      <div id="main-content" className="flex-1">
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
