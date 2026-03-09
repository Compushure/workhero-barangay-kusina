import { protectHRRoute } from '@/actions/shared/auth';
import { HRThemeBodySync } from '@/components/hr/hr-theme-body-sync';
import { Sidebar } from '@/components/hr/sidebar';
import { NavigationOverlay } from '@/components/shared/navigation-overlay';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WorkHero | HR',
  icons: {
    icon: '/assets/website-logo.svg',
    shortcut: '/assets/website-logo.svg',
    apple: '/assets/website-logo.svg',
  },
};

export default async function HRLayout({ children }: { children: React.ReactNode }) {
  await protectHRRoute();
  return (
    <div className="manager-theme flex h-screen bg-background text-foreground">
      <HRThemeBodySync />
      <Sidebar />
      <div className="relative flex-1 min-w-0 overflow-y-auto overflow-x-auto xl:overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <NavigationOverlay />
        <main className="relative z-0 w-full">
          <div
            className="min-w-5xl"
            style={{
              width: 'clamp(1024px, full, full)',
              transform: 'scale(clamp(1024px / full, 1, 1))',
              transformOrigin: 'top left',
            }}
          >
            <div className="w-full">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
