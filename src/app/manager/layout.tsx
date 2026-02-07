import { protectManagerRoute } from '@/actions/shared/auth';
import { Sidebar } from '@/components/manager/task-verification/sidebar';
import React from 'react';

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  await protectManagerRoute();
  return (
    <div className="manager-theme flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
