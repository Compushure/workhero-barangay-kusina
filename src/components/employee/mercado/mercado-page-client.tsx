'use client';

// Employee Mercado modal flow: open a stall, load allowed items, and show pending requests.

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
  // Tracks selected stall interval (weekly/monthly/yearly).
  // Selected interval.
  const { selectedInterval, setSelectedInterval } = useMercadoContext();
  //pending requests and current points.
  const { pendingRequests, userPoints } = useMercadoPageData({
    includeRewards: false,
  });
  // Load all rewards to validate interval availability rules.
  const { data: allRewards = [], isFetched: allRewardsFetched } = useGetRewards();
  // Load rewards only for the currently selected interval (weekly/monthly/yearly).
  const { data: intervalRewards = [], isFetched: intervalRewardsFetched } =
    useGetAvailableRewardsByInterval(selectedInterval);

  // Re-check whether chosen interval is still open after data updates.
  const isSelectedIntervalClosed = useMemo(() => {
    if (!selectedInterval) return false;

    return isIntervalClosed(selectedInterval, allRewards, intervalRewards.length);
  }, [allRewards, intervalRewards.length, selectedInterval]);

  useEffect(() => {
    // Wait until both queries have fetched at least once before deciding to auto-close.
    if (!selectedInterval) return;
    if (!allRewardsFetched || !intervalRewardsFetched) return;
    // If interval became unavailable, clear selection so modal closes cleanly.
    if (isSelectedIntervalClosed) {
      setSelectedInterval(null);
    }
  }, [
    allRewardsFetched,
    intervalRewardsFetched,
    isSelectedIntervalClosed,
    selectedInterval,
    setSelectedInterval,
  ]);

  //modal can disable rewards already requested by the user.
  const pendingRewardIds = useMemo(() => {
    // Prevents duplicate pending requests for the same item.
    return new Set(pendingRequests.map((req) => req.rewardId));
  }, [pendingRequests]);

  return (
    <MonthlyRewardsModal
      // Open immediately on stall selection using current/cached data.
      open={!!selectedInterval}
      // Closing modal clears selected interval so layout returns to neutral state.
      onOpenChange={(open) => !open && setSelectedInterval(null)}
      interval={selectedInterval}
      rewards={intervalRewards}
      userPoints={userPoints}
      pendingRewardIds={pendingRewardIds}
      pendingRequests={pendingRequests}
    />
  );
}
