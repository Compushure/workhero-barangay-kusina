import { BadgeEditorPage } from '@/components/manager/badge-editor/badge-editor-page';
import { CookingPotSuspense } from '@/components/shared/cooking-pot-suspense';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WorkHero | Badge Editor',
  icons: {
    icon: '/assets/website-logo.svg',
    shortcut: '/assets/website-logo.svg',
    apple: '/assets/website-logo.svg',
  },
};

export default function BadgeEditor() {
  return (
    <Suspense fallback={<CookingPotSuspense label="Loading Badges..." />}>
      <BadgeEditorPage />
    </Suspense>
  );
}
``;
