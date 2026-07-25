import { DashboardHeader } from "@/components/layout/dashboard-header";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await getCurrentProfile();

  return (
    <div className="flex min-h-screen flex-col">
      <SkipToContent />
      {profile && <DashboardHeader fullName={profile.full_name} role={profile.role} />}
      <div id="main-content" className="flex-1">
        {children}
      </div>
    </div>
  );
}
