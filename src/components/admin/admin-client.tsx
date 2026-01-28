/**
 * Admin Client Wrapper
 * =====================
 * Client component that handles authentication check for /admin route.
 * Shows LoginPage if not authenticated, otherwise shows DashboardPage.
 */

'use client';

import { AdminLoginPage } from '@/components/auth/login-page';

export function AdminClient() {
  return <AdminLoginPage />;
}
