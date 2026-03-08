import { protectHRRoute } from '@/actions/shared/auth';
import { HRThemeBodySync } from '@/components/hr/hr-theme-body-sync';
import { Sidebar } from '@/components/hr/sidebar';
import { NavigationOverlay } from '@/components/shared/navigation-overlay';

export default async function HRLayout({ children }: { children: React.ReactNode }) {
  await protectHRRoute();
  return (
    <div className="manager-theme flex min-h-screen md:h-screen bg-background text-foreground overflow-x-hidden">
      <HRThemeBodySync />
      <Sidebar />
      <div className="relative flex-1 min-w-0 overflow-y-auto overflow-x-hidden pb-20 md:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <NavigationOverlay />
        <main className="relative z-0 w-full">
          <div className="w-full mx-auto">
            <div className="w-full">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
