import TaskEditorPage from '@/components/manager/task-editor/task-editor-page';
import { Suspense } from 'react';

export default function TaskAssignment() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TaskEditorPage />
    </Suspense>
  );
}
