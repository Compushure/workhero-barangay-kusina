import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useGetRewards } from '@/hooks/tanstack/queries/rewardQueries';
import { useGetMyRedemptionRequests } from '@/hooks/tanstack/queries/redemptionQueries';
import { getEmployeePoints } from '@/actions/employees/get-points';

export function useMercadoPageData() {
  const { data: allRewards = [], isLoading: rewardsLoading, error: rewardsError } = useGetRewards();
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

  const activeRewards = useMemo(() => allRewards.filter((reward) => reward.isActive), [allRewards]);

  const pendingRewardIds = useMemo(
    () => new Set(pendingRequests.map((req) => req.rewardId)),
    [pendingRequests]
  );

  const userPoints = pointsData?.points ?? 0;
  const deductedPoints = pointsData?.deductedPoints ?? 0;
  const isLoading = rewardsLoading || pointsLoading || requestsLoading;

  return {
    activeRewards,
    pendingRewardIds,
    userPoints,
    deductedPoints,
    isLoading,
    error: rewardsError ?? null,
  };
}
