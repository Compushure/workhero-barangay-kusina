import React from 'react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-theme min-h-screen bg-background text-foreground font-sans">
      {children}
    </div>
  );
}
