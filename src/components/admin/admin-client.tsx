/**
 * Admin Client Wrapper
 * =====================
 * Client component that handles authentication check for /admin route.
 * Shows LoginPage if not authenticated, otherwise shows DashboardPage.
 */

'use client'

import { useAuth } from '@/lib/auth-context'
import { LoginPage } from '@/components/auth/login-page'
import { DashboardPage } from '@/components/admin/dashboard-page'

export function AdminClient() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <DashboardPage />
}
