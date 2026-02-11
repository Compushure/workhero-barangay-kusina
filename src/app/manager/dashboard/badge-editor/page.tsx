import {BadgeEditorPage}from '@/components/manager/badge-editor/badge-editor-page';
import { CookingPotSuspense } from '@/components/shared/cooking-pot-suspense';
import { Suspense } from 'react';

export default function BadgeEditor() {
  return (
    <Suspense fallback={<CookingPotSuspense label="Loading Badges..." />}>
      <BadgeEditorPage />
    </Suspense>
  );
}
``