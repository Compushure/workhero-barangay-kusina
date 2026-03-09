/**
 * Admin Route (Server Component)
 * ===============================
 * Server component wrapper for the admin dashboard.
 * Uses Suspense boundary with SuperadminLoginContainer nested inside.
 */

import { Suspense } from 'react';
import { SuperadminLoginContainer } from '@/components/auth/login/superadmin/superadmin-login-container';
import { redirectifSessionExists } from '@/actions/shared/auth';
import { LoginCogSuspense } from '@/components/shared/login-cog-suspense';

export function LoadingFallback() {
  return <LoginCogSuspense label="Loading admin login..." />;
}

export default async function AdminLoginPage() {
  await redirectifSessionExists();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuperadminLoginContainer />
    </Suspense>
  );
}
