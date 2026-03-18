import { Suspense } from 'react';
import type { Metadata } from 'next';
import { VerificationRequestsPage } from '@/components/manager/task-verification/verification-request-page';
import { CookingPotSuspense } from '@/components/shared/cooking-pot-suspense';
import { fetchTasksToReview } from '@/actions/manager/verification';

export const metadata: Metadata = {
  title: 'WorkHero | Task Verification',
  icons: {
    icon: '/assets/website-logo.svg',
    shortcut: '/assets/website-logo.svg',
    apple: '/assets/website-logo.svg',
  },
};

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
