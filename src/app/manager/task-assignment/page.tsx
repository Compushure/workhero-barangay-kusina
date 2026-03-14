import { TaskAssignmentPage } from '@/components/manager/task-assignment/task-assignment-page';
import { CookingPotSuspense } from '@/components/shared/cooking-pot-suspense';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WorkHero | Task Assignment',
  icons: {
    icon: '/assets/website-logo.svg',
    shortcut: '/assets/website-logo.svg',
    apple: '/assets/website-logo.svg',
  },
};

export default function TaskAssignment() {
  return (
    <Suspense fallback={<CookingPotSuspense label="Loading Assigned Tasks..." />}>
      <TaskAssignmentPage />
    </Suspense>
  );
}
