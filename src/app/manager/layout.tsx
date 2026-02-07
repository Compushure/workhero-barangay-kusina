import { protectManagerRoute } from '@/actions/shared/auth';
import { Sidebar } from '@/components/manager/task-verification/sidebar';
import { NavigationOverlay } from '@/components/shared/navigation-overlay';
import React from 'react';

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  await protectManagerRoute();
  return (
    <div className="manager-theme flex h-screen bg-gray-100">
      <Sidebar />
      <div className="relative flex-1 overflow-auto">
        <NavigationOverlay />
        <main className="relative z-0">{children}</main>
      </div>
    </div>
  );
}
