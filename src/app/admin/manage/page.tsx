/**
 * Manage Route (Server Component)
 * =================================
 * Server component wrapper for user management page.
 * Uses Suspense boundary with ManageClient nested inside.
 */

import { Suspense } from 'react';
import { ManageClient } from '@/components/admin/manage-client';
import { protectAdminRoute } from '@/actions/shared/auth';
import { UserManagementSuspense } from '@/components/shared/user-management-suspense';

function LoadingFallback() {
  return <UserManagementSuspense label="Loading user management..." />;
}

export default async function Manage() {
  await protectAdminRoute();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ManageClient />
    </Suspense>
  );
}
