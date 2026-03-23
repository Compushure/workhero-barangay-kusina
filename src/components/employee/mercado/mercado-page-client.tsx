'use client';

import { useEffect, useMemo } from 'react';
import { useMercadoContext } from './mercado-context';
import { useMercadoPageData } from '@/hooks/useMercadoPageData';
import { MonthlyRewardsModal } from '@/components/employee/modals/monthly-rewards-modal';
import {
  useGetAvailableRewardsByInterval,
  useGetRewards,
} from '@/hooks/tanstack/queries/rewardQueries';
import { isIntervalClosed } from './mercado-stall-state';

export function MercadoPageClient() {
  const { selectedInterval, setSelectedInterval } = useMercadoContext();
  const { pendingRequests, userPoints } = useMercadoPageData({
    includeRewards: false,
  });
  const { data: allRewards = [], isLoading: allRewardsLoading } = useGetRewards();
  const { data: intervalRewards = [], isLoading: intervalRewardsLoading } =
    useGetAvailableRewardsByInterval(selectedInterval);

  const isSelectedIntervalClosed = useMemo(() => {
    if (!selectedInterval) return false;

    return isIntervalClosed(selectedInterval, allRewards, intervalRewards.length);
  }, [allRewards, intervalRewards.length, selectedInterval]);

  useEffect(() => {
    if (!selectedInterval) return;
    if (intervalRewardsLoading || allRewardsLoading) return;
    if (isSelectedIntervalClosed) {
      setSelectedInterval(null);
    }
  }, [
    allRewardsLoading,
    intervalRewardsLoading,
    isSelectedIntervalClosed,
    selectedInterval,
    setSelectedInterval,
  ]);

  const pendingRewardIds = useMemo(() => {
    return new Set(pendingRequests.map((req) => req.rewardId));
  }, [pendingRequests]);

  return (
    <MonthlyRewardsModal
      open={!!selectedInterval && !isSelectedIntervalClosed}
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
