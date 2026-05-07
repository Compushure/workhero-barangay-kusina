import { useMemo } from 'react';
import { useGetEmployeePoints } from '@/hooks/tanstack/queries/employeeQueries';
import { useGetAvailableRewards } from '@/hooks/tanstack/queries/rewardQueries';
import { useGetMyRedemptionRequests } from '@/hooks/tanstack/queries/redemptionQueries';

export function useMercadoPageData(options?: { includeRewards?: boolean }) {
  // Toggle lets some screens load points/requests without reward cards.

  // - Combines three queries (rewards, pending requests, points) into one
  //   small object the UI can read from. This keeps the components simpler.
  const includeRewards = options?.includeRewards ?? true;

  // Use employee-specific query that filters by isActive AND availableDate
  const {
    data: activeRewards = [],
    isLoading: rewardsLoading,
    error: rewardsError,
  } = useGetAvailableRewards({ enabled: includeRewards });
  const { data: pendingRequests = [], isLoading: requestsLoading } =
    useGetMyRedemptionRequests('pending');
  const { data: pointsData, isLoading: pointsLoading } = useGetEmployeePoints();

  // Build final values consumed by Mercado UI components.
  const userPoints = pointsData?.points ?? 0;
  const deductedPoints = pointsData?.deductedPoints ?? 0;
  const isLoading = (includeRewards && rewardsLoading) || pointsLoading || requestsLoading;

  return {
    activeRewards,
    pendingRequests,
    userPoints,
    deductedPoints,
    isLoading,
    error: includeRewards ? rewardsError ?? null : null,
  };
}
