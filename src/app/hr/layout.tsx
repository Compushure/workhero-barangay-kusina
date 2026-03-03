import { protectHRRoute } from '@/actions/shared/auth';
import { HRThemeBodySync } from '@/components/hr/hr-theme-body-sync';
import { Sidebar } from '@/components/hr/sidebar';
import { NavigationOverlay } from '@/components/shared/navigation-overlay';

export default async function HRLayout({ children }: { children: React.ReactNode }) {
  await protectHRRoute();
  return (
    <div className="hr-theme flex min-h-screen bg-background text-foreground">
      <HRThemeBodySync />
      <Sidebar />
      <div className="relative flex-1">
        <NavigationOverlay />
        <main className="relative z-0">{children}</main>
      </div>
    </div>
  );
}
