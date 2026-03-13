/**
 * Employee Query Hooks
 * ====================
 * TanStack Query hooks for fetching employee-specific data.
 * Provides type-safe, cached queries with automatic refetching capabilities.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  handleFetchEmployeeRank,
  handleFetchEmployeePoints,
  handleFetchEmployeeTopRanksByPeriod,
  handleFetchEmployeeTopWeeklyRanks,
  handleFetchEmployeeXP,
} from '@/action-handlers/employee/stats';
import type { EmployeePeriodParams } from '@/action-handlers/employee/stats';
import { fetchUserBadgesHandler } from '@/action-handlers/employee/badges';
import { getLatestLeaderboardPeriods, getVisibleRankingPeriods } from '@/actions/hr/leaderboard';
import type { EmployeeRank, EmployeeTopRankEntry, RankingPeriodWithTop } from '@/types';
import type { LatestPeriods } from '@/components/employee/leaderboard/period-nav';
import type { EmployeePointsData } from '@/types/employee/points';
import type { EmployeeXP } from '@/types/employee/xp';
import type { UserBadge } from '@/actions/employee/badges';

/**
 * Query key factory for employee-related queries
 * Centralizes query key management for consistency and cache invalidation
 *
 * @example
 * // Invalidate all employee queries
 * queryClient.invalidateQueries({ queryKey: employeeKeys.all })
 *
 * // Invalidate rank query
 * queryClient.invalidateQueries({ queryKey: employeeKeys.rank() })
 */
export const employeeKeys = {
  all: ['employees'] as const,
  rank: () => [...employeeKeys.all, 'rank'] as const,
  topWeeklyRanks: () => [...employeeKeys.all, 'top-weekly-ranks'] as const,
  topRanksByPeriod: (params: EmployeePeriodParams) =>
    [
      ...employeeKeys.all,
      'top-ranks-by-period',
      params.periodType,
      params.year,
      params.periodType === 'weekly' ? params.week : params.periodType === 'monthly' ? params.month : null,
    ] as const,
  points: () => [...employeeKeys.all, 'points'] as const,
  xp: () => [...employeeKeys.all, 'xp'] as const,
  badges: () => [...employeeKeys.all, 'badges'] as const,
  userBadges: (userId: string) => [...employeeKeys.badges(), userId] as const,
  visiblePeriods: () => [...employeeKeys.all, 'visible-periods'] as const,
  latestPeriods: () => [...employeeKeys.all, 'latest-periods'] as const,
};

export function useGetEmployeePoints(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<EmployeePointsData | null, Error> {
  return useQuery({
    queryKey: employeeKeys.points(),
    queryFn: async () => {
      return await handleFetchEmployeePoints();
    },
    enabled: queryOptions.enabled !== false,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<EmployeePointsData | null, Error>;
}

export function useGetEmployeeXP(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<EmployeeXP | null, Error> {
  return useQuery({
    queryKey: employeeKeys.xp(),
    queryFn: async () => {
      return await handleFetchEmployeeXP();
    },
    enabled: queryOptions.enabled !== false,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<EmployeeXP | null, Error>;
}

/**
 * Fetches the current employee's rank among all regular employees
 * Uses RPC function that calculates rank efficiently with window functions
 *
 * @param options - Query options (enabled, staleTime, etc.)
 * @returns Query result with EmployeeRank data, loading state, and error handling
 *
 * @example
 * ```tsx
 * function RankWidget() {
 *   const { data: rankData, isLoading, error } = useGetEmployeeRank()
 *
 *   if (isLoading) return <Skeleton />
 *   if (error || !rankData) return null
 *
 *   return <div>Rank #{rankData.rank} of {rankData.totalEmployees}</div>
 * }
 * ```
 */
export function useGetEmployeeRank(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<EmployeeRank | null, Error> {
  return useQuery({
    queryKey: employeeKeys.rank(),
    queryFn: async () => {
      const result = await handleFetchEmployeeRank();
      return result;
    },
    enabled: queryOptions.enabled !== false,
    staleTime: 0,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 1000,
    refetchIntervalInBackground: false,
  }) as UseQueryResult<EmployeeRank | null, Error>;
}

/**
 * Fetches the top 10 weekly rankings for the latest visible period.
 * Used by the employee dashboard rank panel to show the leaderboard list.
 */
export function useGetEmployeeTopWeeklyRanks(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<EmployeeTopRankEntry[] | null, Error> {
  return useQuery({
    queryKey: employeeKeys.topWeeklyRanks(),
    queryFn: async () => handleFetchEmployeeTopWeeklyRanks(),
    enabled: queryOptions.enabled !== false,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<EmployeeTopRankEntry[] | null, Error>;
}

/**
 * Fetches the top 10 rankings for a specific period (weekly, monthly, or yearly).
 * Use for employee leaderboard when navigating by period.
 */
export function useGetEmployeeTopRanksByPeriod(
  params: EmployeePeriodParams | null,
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<EmployeeTopRankEntry[] | null, Error> {
  return useQuery({
    queryKey: params ? employeeKeys.topRanksByPeriod(params) : ['employees', 'top-ranks-by-period', 'disabled'],
    queryFn: async () => (params ? handleFetchEmployeeTopRanksByPeriod(params) : null),
    enabled: (queryOptions.enabled !== false) && params !== null,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<EmployeeTopRankEntry[] | null, Error>;
}

/**
 * Fetches all HR-generated ranking periods that are visible to employees.
 * Used by the employee leaderboard "Past Rankings" history list.
 */
export function useGetEmployeeVisiblePeriods(): UseQueryResult<RankingPeriodWithTop[] | null, Error> {
  return useQuery({
    queryKey: employeeKeys.visiblePeriods(),
    queryFn: async () => {
      const result = await getVisibleRankingPeriods();
      if (!result.success) return null;
      return result.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<RankingPeriodWithTop[] | null, Error>;
}

/**
 * Fetches the latest generated periods (weekly, monthly, yearly) with their visibility state.
 *
 * - initialData: SSR-fetched snapshot for instant first render (no loading flash)
 * - initialDataUpdatedAt: 0: marks SSR data as immediately stale so a fresh fetch fires on
 *   every mount (stale-while-revalidate pattern). This ensures same-tab navigation always
 *   reflects the latest visibility state.
 * - refetchInterval: polls every 30 s while the tab is focused so cross-tab visibility
 *   changes (HR toggling in another tab) are picked up without a full page refresh.
 */
export function useGetLatestLeaderboardPeriods(
  initialData?: LatestPeriods
): UseQueryResult<LatestPeriods, Error> {
  return useQuery({
    queryKey: employeeKeys.latestPeriods(),
    queryFn: async () => {
      const result = await getLatestLeaderboardPeriods();
      if (!result.success) throw new Error(result.error ?? 'Failed to fetch latest periods');
      return result.data ?? { weekly: null, monthly: null, yearly: null };
    },
    initialData,
    initialDataUpdatedAt: 0,
    staleTime: 0,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 1000,
    refetchIntervalInBackground: false,
  }) as UseQueryResult<LatestPeriods, Error>;
}

/**
 * Fetches all badges earned by a specific user
 * Returns badges in reverse chronological order (newest first)
 *
 * @param userId - The ID of the user to fetch badges for
 * @returns Query result with UserBadge[] data, loading state, and error handling
 *
 * @example
 * ```tsx
 * function UserBadges({ userId }: { userId: string }) {
 *   const { data: badges, isLoading } = useGetUserBadges(userId)
 *
 *   if (isLoading) return <Skeleton />
 *   if (!badges?.length) return <div>No badges earned yet</div>
 *
 *   return (
 *     <div>
 *       {badges.map(badge => (
 *         <BadgeCard key={badge.badge_id} badge={badge} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useGetUserBadges(
  userId: string
): UseQueryResult<UserBadge[] | null, Error> {
  return useQuery({
    queryKey: employeeKeys.userBadges(userId),
    queryFn: async () => {
      return await fetchUserBadgesHandler(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<UserBadge[] | null, Error>;
}
