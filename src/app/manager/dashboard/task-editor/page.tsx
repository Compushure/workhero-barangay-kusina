import TaskEditorPage from '@/components/manager/task-editor/task-editor-page';
import { CookingPotSuspense } from '@/components/shared/cooking-pot-suspense';
import { Suspense } from 'react';

export default function TaskEditor() {
  return (
    <Suspense fallback={<CookingPotSuspense label="Loading Task Categories..." />}>
      <TaskEditorPage />
    </Suspense>
  );
}
