import TaskEditorPage from '@/components/manager/task-editor/task-editor-page';
import { CookingPotSuspense } from '@/components/shared/cooking-pot-suspense';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WorkHero | Task Editor',
  icons: {
    icon: '/assets/website-logo.svg',
    shortcut: '/assets/website-logo.svg',
    apple: '/assets/website-logo.svg',
  },
};

export default function TaskEditor() {
  return (
    <Suspense fallback={<CookingPotSuspense label="Loading Task Categories..." />}>
      <TaskEditorPage />
    </Suspense>
  );
}
