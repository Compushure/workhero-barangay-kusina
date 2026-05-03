import { MarketSuspense } from '@/components/shared/market-suspense';

// Loading state for the HR request-review page.

export default function RewardRequestsLoading() {
  return <MarketSuspense label="Loading redemption requests..." />;
}
