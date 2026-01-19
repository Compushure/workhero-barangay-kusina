import { TaskAssignmentPage } from '@/components/manager/task-assignment/task-assignment-page';
import { Suspense } from 'react';

export default function TaskAssignment() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TaskAssignmentPage />
    </Suspense>
  );
}
