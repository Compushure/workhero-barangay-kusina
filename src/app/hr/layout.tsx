import { protectHRRoute } from '@/actions/shared/auth';
import { HRThemeBodySync } from '@/components/hr/hr-theme-body-sync';
import { Sidebar } from '@/components/shared/sidebar';
import { NavigationOverlay } from '@/components/shared/navigation-overlay';
import { QueryProvider } from '@/lib/providers/query-provider';
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
  // Block non-HR users on the server before anything renders.
  await protectHRRoute();
  return (
    // Set up shared React Query state so HR pages can fetch/cache data consistently.
    <QueryProvider>
      <div className="manager-theme flex min-h-screen md:h-screen bg-background text-foreground overflow-x-hidden">
        {/* Keep HR theme classes synchronized with the document body. */}
        <HRThemeBodySync />
        {/* Render the HR sidebar navigation (same shell used by manager/hr variants). */}
        <Sidebar view="hr" />
        <div className="relative flex-1 min-w-0 overflow-y-auto overflow-x-hidden pb-20 md:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Show a transition overlay while route navigation is in progress. */}
          <NavigationOverlay />
          <main className="relative z-0 w-full">
            <div className="w-full mx-auto">
              {/* Render whichever HR page is currently active (leaderboard, mercado, requests, etc.). */}
              <div className="w-full">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </QueryProvider>
  );
}
