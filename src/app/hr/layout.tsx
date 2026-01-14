import { protectHRRoute } from '@/actions/auth';
import React from 'react';

export default async function HRLayout({ children }: { children: React.ReactNode }) {
  await protectHRRoute();
  return (
    <div className="hr-theme min-h-screen bg-background text-foreground font-sans">{children}</div>
  );
}
