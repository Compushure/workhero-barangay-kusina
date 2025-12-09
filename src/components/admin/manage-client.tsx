/**
 * Manage Client Wrapper
 * ======================
 * Client component that handles authentication check for /admin/manage route.
 * Shows LoginPage if not authenticated, otherwise shows ManagerPage.
 */

'use client'

import { ManagerPage } from '@/components/admin/manager-page'

export function ManageClient() {
  return <ManagerPage />
}
