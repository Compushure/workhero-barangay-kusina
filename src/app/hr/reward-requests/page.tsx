import { Suspense } from 'react';
import type { Metadata } from 'next';
import { RewardRequestsContent } from '@/components/hr/requests/reward-requests-content';
import { MarketSuspense } from '@/components/shared/market-suspense';

// HR page entry for reviewing employee redemption requests.

export const metadata: Metadata = {
  title: 'WorkHero | Reward Requests',
  icons: {
    icon: '/assets/website-logo.svg',
    shortcut: '/assets/website-logo.svg',
    apple: '/assets/website-logo.svg',
  },
};

export default function RewardRequestsPage() {
  return (
    <Suspense fallback={<MarketSuspense label="Loading redemption requests..." />}>
      <RewardRequestsContent />
    </Suspense>
  );
}
