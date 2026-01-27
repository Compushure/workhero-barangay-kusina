import React from 'react';
import { protectAdminRoute } from '@/actions/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await protectAdminRoute();
  return (
    <div className="admin-theme min-h-screen bg-background text-foreground font-sans">
      {children}
    </div>
  );
}
