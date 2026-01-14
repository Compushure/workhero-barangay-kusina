import { protectEmployeeRoute } from '@/actions/auth';
import React from 'react';

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  await protectEmployeeRoute();
  return (
    <div className="employee-theme min-h-screen bg-background text-foreground font-sans">
      {children}
    </div>
  );
}
