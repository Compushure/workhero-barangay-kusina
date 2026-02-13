import BadgeAssignmentPage from '@/components/manager/badge-assignment/badge-assignment-page';

import { CookingPotSuspense } from '@/components/shared/cooking-pot-suspense';
import { Suspense } from 'react';

export default function BadgeEditor() {
  return (
    <Suspense fallback={<CookingPotSuspense label="Assigning Badges..." />}>
        <BadgeAssignmentPage/>
    </Suspense> 
  );
}
``