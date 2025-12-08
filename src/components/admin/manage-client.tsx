/**
 * Manage Client Wrapper
 * ======================
 * Client component that handles authentication check for /admin/manage route.
 * Shows LoginPage if not authenticated, otherwise shows ManagerPage.
 */

'use client'

import { useAuth } from '@/lib/auth-context'

import { ManagerPage } from '@/components/admin/manager-page'
import { protectRoute } from '@/actions/auth'

export function ManageClient() {
  return <ManagerPage />
}
