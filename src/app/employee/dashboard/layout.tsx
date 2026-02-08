import React from 'react';
import { SidebarNavigation } from '@/components/employee/sidebar-navigation';

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-1/4">
        <SidebarNavigation />
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
