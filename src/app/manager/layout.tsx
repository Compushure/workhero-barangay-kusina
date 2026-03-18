import { protectManagerRoute } from '@/actions/shared/auth';
import { ManagerThemeBodySync } from '@/components/manager/manager-theme-body-sync';
import { Sidebar } from '@/components/shared/sidebar';
import { NavigationOverlay } from '@/components/shared/navigation-overlay';
import React from 'react';

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  await protectManagerRoute();
  return (
    <div className="manager-theme flex min-h-screen md:h-screen bg-gray-200 text-foreground overflow-x-hidden">
      <ManagerThemeBodySync />
      <Sidebar view="manager" />
      <div className="relative flex-1 min-w-0 overflow-y-auto overflow-x-hidden pb-20 md:pb-0">
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
