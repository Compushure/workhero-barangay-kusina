import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useGetAvailableRewards } from '@/hooks/tanstack/queries/rewardQueries';
import { useGetMyRedemptionRequests } from '@/hooks/tanstack/queries/redemptionQueries';
import { getEmployeePoints } from '@/actions/employees/get-points';

export function useMercadoPageData() {
  // Use employee-specific query that filters by isActive AND availableDate
  const { data: activeRewards = [], isLoading: rewardsLoading, error: rewardsError } = useGetAvailableRewards();
  const { data: pendingRequests = [], isLoading: requestsLoading } =
    useGetMyRedemptionRequests('pending');
  const { data: pointsData, isLoading: pointsLoading } = useQuery({
    queryKey: ['employeePoints'],
    queryFn: async () => {
      const result = await getEmployeePoints();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch points');
      }
      return result.data;
    },
  });

  // No need to filter rewards anymore - useGetAvailableRewards handles all filtering
  const userPoints = pointsData?.points ?? 0;
  const deductedPoints = pointsData?.deductedPoints ?? 0;
  const isLoading = rewardsLoading || pointsLoading || requestsLoading;

  return {
    activeRewards,
    pendingRequests,
    userPoints,
    deductedPoints,
    isLoading,
    error: rewardsError ?? null,
  };
}
