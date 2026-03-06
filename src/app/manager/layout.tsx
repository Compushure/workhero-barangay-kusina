import { protectManagerRoute } from '@/actions/shared/auth';
import { ManagerThemeBodySync } from '@/components/manager/manager-theme-body-sync';
import { Sidebar } from '@/components/manager/task-verification/sidebar';
import { NavigationOverlay } from '@/components/shared/navigation-overlay';
import React from 'react';

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  await protectManagerRoute();
  return (
    <div className="manager-theme flex h-screen bg-background text-foreground">
      <ManagerThemeBodySync />
      <Sidebar />
      <div className="relative flex-1 min-w-0 overflow-y-auto overflow-x-auto xl:overflow-x-hidden">
        <NavigationOverlay />
        <main className="relative z-0 w-full">
          <div
            className="min-w-[1024px]"
            style={{
              width: 'clamp(1024px, full, full)',
              transform: 'scale(clamp(1024px / full, 1, 1))',
              transformOrigin: 'top left',
            }}
          >
            <div className="w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
