import React from 'react';
import { protectAdminRoute } from '@/actions/shared/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WorkHero | Admin Dashboard',
  description: 'Manage employees, roles, and system settings',
  robots: 'noindex, nofollow', // Prevent search engines from indexing admin pages
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await protectAdminRoute();
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {children}
    </div>
  );
}
