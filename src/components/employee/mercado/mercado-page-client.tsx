'use client';

import { useMemo } from 'react';
import { useMercadoContext } from './mercado-context';
import { useMercadoPageData } from '@/hooks/useMercadoPageData';
import { MonthlyRewardsModal } from '@/components/employee/modals/monthly-rewards-modal';
import { useGetAvailableRewardsByInterval } from '@/hooks/tanstack/queries/rewardQueries';

export function MercadoPageClient() {
  const { selectedInterval, setSelectedInterval } = useMercadoContext();
  const { pendingRequests, userPoints } = useMercadoPageData({
    includeRewards: false,
  });
  const { data: intervalRewards = [], isLoading: intervalRewardsLoading } =
    useGetAvailableRewardsByInterval(selectedInterval);

  const pendingRewardIds = useMemo(() => {
    return new Set(pendingRequests.map((req) => req.rewardId));
  }, [pendingRequests]);

  return (
    <MonthlyRewardsModal
      open={!!selectedInterval}
      onOpenChange={(open) => !open && setSelectedInterval(null)}
      interval={selectedInterval}
      onIntervalChange={setSelectedInterval}
      rewards={intervalRewards}
      isLoading={intervalRewardsLoading}
      userPoints={userPoints}
      pendingRewardIds={pendingRewardIds}
      pendingRequests={pendingRequests}
    />
  );
}
