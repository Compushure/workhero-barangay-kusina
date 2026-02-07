import TaskEditorPage from '@/components/manager/task-editor/task-editor-page';
import { CookingPot } from 'lucide-react';
import { Suspense } from 'react';

export default function TaskEditor() {
  return (
    <Suspense fallback={
      <div className='h-full w-full justify-center items-center flex flex-col gap-1'>
        <CookingPot className='animate-bounce size-10'/>
        <span>Loading Task Categories...</span>
      </div>
    }>
      <TaskEditorPage />
    </Suspense>
  );
}
