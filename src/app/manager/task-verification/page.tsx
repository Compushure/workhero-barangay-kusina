import { Suspense } from 'react';
import { VerificationRequestsPage } from '@/components/Manager/task-verification/verification-request-page';
import { Sidebar } from '@/components/Manager/Task-Verification/sidebar';
import { fetchTasksToReview } from '@/actions/manager';

export default async function Manager() {
  const { data, error } = await fetchTasksToReview();

  // Handle null data with default empty array
  const initialRequests = data ?? [];

  if (error) {
    console.error('Error fetching tasks:', error);
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <VerificationRequestsPage initialRequests={initialRequests} />
        </main>
      </div>
    </Suspense>
  );
}
