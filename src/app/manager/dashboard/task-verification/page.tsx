import { Suspense } from 'react';
import { VerificationRequestsPage } from '@/components/manager/task-verification/verification-request-page';
import { CookingPotSuspense } from '@/components/shared/cooking-pot-suspense';
import { fetchTasksToReview } from '@/actions/manager/verification';

export default async function TaskVerification() {
  const { data, error } = await fetchTasksToReview();

  // Handle null data with default empty array
  const initialRequests = data ?? [];

  if (error) {
    console.error('Error fetching tasks:', error);
  }

  return (
    <Suspense fallback={<CookingPotSuspense label="Loading Requests from Employees..." />}>
      <VerificationRequestsPage initialRequests={initialRequests} />
    </Suspense>
  );
}
