'use client';

import { useEffect, useMemo } from 'react';
import { useMercadoContext } from './mercado-context';
import { useMercadoPageData } from '@/hooks/useMercadoPageData';
import { MonthlyRewardsModal } from '@/components/employee/modals/monthly-rewards-modal';
import {
  useGetAvailableRewardsByInterval,
  useGetRewards,
} from '@/hooks/tanstack/queries/rewardQueries';

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

    const hasAnyIntervalItem = allRewards.some(
      (reward) => reward.availableMonth === selectedInterval
    );
    const hasVisibleIntervalItem = allRewards.some(
      (reward) => reward.availableMonth === selectedInterval && reward.isActive
    );

    const hiddenOnly = hasAnyIntervalItem && !hasVisibleIntervalItem;
    const noAvailableItems = intervalRewards.length === 0;

    return hiddenOnly || noAvailableItems;
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
