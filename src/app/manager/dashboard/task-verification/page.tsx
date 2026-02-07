import { Suspense } from 'react';
import { VerificationRequestsPage } from '@/components/manager/task-verification/verification-request-page';
import { CookingPot } from 'lucide-react';
import { fetchTasksToReview } from '@/actions/manager/verification';

export default async function TaskVerification() {
  const { data, error } = await fetchTasksToReview();

  // Handle null data with default empty array
  const initialRequests = data ?? [];

  if (error) {
    console.error('Error fetching tasks:', error);
  }

  return (
    <Suspense fallback={
      <div className='h-full w-full justify-center items-center flex flex-col gap-1'>
        <CookingPot className='animate-bounce size-10'/>
        <span>Loading Requests from Emmployees...</span>
      </div>
    }>
      <VerificationRequestsPage initialRequests={initialRequests} />
    </Suspense>
  );
}
