/**
 * Manage Client Wrapper
 * ======================
 * Client component that handles authentication check for /admin/manage route.
 * Shows LoginPage if not authenticated, otherwise shows ManagerPage.
 */

'use client'

import { useAuth } from '@/lib/auth-context'
import { LoginPage } from '@/components/auth/login-page'
import { ManagerPage } from '@/components/admin/manager-page'

export function ManageClient() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <ManagerPage />
}
