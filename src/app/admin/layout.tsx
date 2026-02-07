import React from 'react';
import { protectAdminRoute } from '@/actions/shared/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | WorkHero',
  description: 'Manage employees, roles, and system settings',
  robots: 'noindex, nofollow', // Prevent search engines from indexing admin pages
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await protectAdminRoute();
  return (
    <div className="admin-theme min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
