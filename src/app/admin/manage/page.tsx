/**
 * Manage Route (Server Component)
 * =================================
 * Server component wrapper for user management page.
 * Uses Suspense boundary with ManageClient nested inside.
 * Checks authorization and shows toast if user cannot access.
 */

import { Suspense } from 'react'
import { ManageClient } from '@/components/admin/manage-client'
import { ProtectedRoute } from '@/components/admin/protected-route'
import { getAdminAccessInfo } from '@/actions/auth'

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-muted-foreground">
          Loading user management...
        </span>
      </div>
    </div>
  )
}

export default async function Manage() {
  const accessInfo = await getAdminAccessInfo()

  return (
    <ProtectedRoute
      isAuthorized={accessInfo.isAuthorized}
      userRole={accessInfo.role}
      message={accessInfo.message}
    >
      <Suspense fallback={<LoadingFallback />}>
        <ManageClient />
      </Suspense>
    </ProtectedRoute>
  )
}
