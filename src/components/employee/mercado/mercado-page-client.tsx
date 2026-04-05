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
  // Selected interval.
  const { selectedInterval, setSelectedInterval } = useMercadoContext();
  //pending requests and current points.
  const { pendingRequests, userPoints } = useMercadoPageData({
    includeRewards: false,
  });
  // Load all rewards to validate interval availability rules.
  const { data: allRewards = [], isLoading: allRewardsLoading } = useGetRewards();
  // Load rewards only for the currently selected interval (weekly/monthly/yearly).
  const { data: intervalRewards = [], isLoading: intervalRewardsLoading } =
    useGetAvailableRewardsByInterval(selectedInterval);

  // Re-check whether chosen interval is still open after data updates.
  const isSelectedIntervalClosed = useMemo(() => {
    if (!selectedInterval) return false;

    return isIntervalClosed(selectedInterval, allRewards, intervalRewards.length);
  }, [allRewards, intervalRewards.length, selectedInterval]);

  useEffect(() => {
    // Wait until data is ready before deciding to auto-close the modal.
    if (!selectedInterval) return;
    if (intervalRewardsLoading || allRewardsLoading) return;
    // If interval became unavailable, clear selection so modal closes cleanly.
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

  //modal can disable rewards already requested by the user.
  const pendingRewardIds = useMemo(() => {
    return new Set(pendingRequests.map((req) => req.rewardId));
  }, [pendingRequests]);

  return (
    <MonthlyRewardsModal
      // Modal opens only when interval is selected and still valid/open.
      open={!!selectedInterval && !isSelectedIntervalClosed}
      // Closing modal clears selected interval so layout returns to neutral state.
      onOpenChange={(open) => !open && setSelectedInterval(null)}
      interval={selectedInterval}
      rewards={intervalRewards}
      isLoading={intervalRewardsLoading}
      userPoints={userPoints}
      pendingRewardIds={pendingRewardIds}
      pendingRequests={pendingRequests}
    />
  );
}
