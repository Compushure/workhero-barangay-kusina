/**
 * Admin Route (Server Component)
 * ===============================
 * Server component wrapper for the admin dashboard.
 * Uses Suspense boundary with AdminClient nested inside.
 */

import { Suspense } from 'react';
import { AdminClient } from '@/components/admin/admin-client';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
}

export default function Admin() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdminClient />
    </Suspense>
  );
}
