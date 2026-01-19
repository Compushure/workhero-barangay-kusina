import { Suspense } from 'react';
import { VerificationRequestsPage } from '@/components/Manager/Task-Verification/verification-request-page';
import { fetchTasksToReview } from '@/actions/manager';

export default async function TaskVerification() {
  const { data, error } = await fetchTasksToReview();

  // Handle null data with default empty array
  const initialRequests = data ?? [];

  if (error) {
    console.error('Error fetching tasks:', error);
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerificationRequestsPage initialRequests={initialRequests} />
    </Suspense>
  );
}
