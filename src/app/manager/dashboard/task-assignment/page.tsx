import { TaskAssignmentPage } from '@/components/manager/task-assignment/task-assignment-page';
import { CookingPot } from 'lucide-react';
import { Suspense } from 'react';

export default function TaskAssignment() {
  return (
    <Suspense fallback={
      <div className='h-full w-full justify-center items-center flex flex-col gap-1'>
        <CookingPot className='animate-bounce size-10'/>
        <span>Loading Assigned Tasks...</span>
      </div>
    }>
      <TaskAssignmentPage />
    </Suspense>
  );
}
