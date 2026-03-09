/**
 * Admin Route (Server Component)
 * ===============================
 * Server component wrapper for the admin dashboard.
 * Uses Suspense boundary with SuperadminLoginContainer nested inside.
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SuperadminLoginContainer } from '@/components/auth/login/superadmin/superadmin-login-container';
import { redirectifSessionExists } from '@/actions/shared/auth';
import { LoginCogSuspense } from '@/components/shared/login-cog-suspense';

export const metadata: Metadata = {
  title: 'WorkHero | Admin Login',
  icons: {
    icon: '/assets/website-logo.svg',
    shortcut: '/assets/website-logo.svg',
    apple: '/assets/website-logo.svg',
  },
};

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
