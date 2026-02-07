import { Suspense } from 'react';
import { RewardRequestsContent } from '@/components/hr/reward-requests/reward-requests-content';
import { MarketSuspense } from '@/components/shared/market-suspense';

export default function RewardRequestsPage() {
  return (
    <Suspense fallback={<MarketSuspense label="Loading redemption requests..." />}>
      <RewardRequestsContent />
    </Suspense>
  );
}
