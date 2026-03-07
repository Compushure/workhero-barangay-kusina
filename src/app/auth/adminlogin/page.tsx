/**
 * Admin Route (Server Component)
 * ===============================
 * Server component wrapper for the admin dashboard.
 * Uses Suspense boundary with SuperadminLoginContainer nested inside.
 */

import { Suspense } from 'react';
import { SuperadminLoginContainer } from '@/components/auth/login/superadmin/superadmin-login-container';
import { redirectifSessionExists } from '@/actions/shared/auth';

export function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
}

export default async function AdminLoginPage() {
  await redirectifSessionExists();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuperadminLoginContainer />
    </Suspense>
  );
}
