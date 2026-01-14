import { protectManagerRoute } from '@/actions/auth';
import React from 'react';

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  await protectManagerRoute();
  return (
    <div className="manager-theme min-h-screen bg-background text-foreground font-sans">
      {children}
    </div>
  );
}
