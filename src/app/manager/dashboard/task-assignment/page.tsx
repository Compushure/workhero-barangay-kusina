import { TaskAssignmentPage } from '@/components/manager/task-assignment/task-assignment-page';
import { CookingPotSuspense } from '@/components/shared/cooking-pot-suspense';
import { Suspense } from 'react';

export default function TaskAssignment() {
  return (
    <Suspense fallback={<CookingPotSuspense label="Loading Assigned Tasks..." />}>
      <TaskAssignmentPage />
    </Suspense>
  );
}
