/**
 * Employee Query Hooks
 * ====================
 * TanStack Query hooks for fetching employee-specific data.
 * Provides type-safe, cached queries with automatic refetching capabilities.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { handleFetchEmployeeRank } from '@/action-handlers/employee/stats';
import { fetchUserBadgesHandler } from '@/action-handlers/employee/badges';
import type { EmployeeRank } from '@/types';
import type { UserBadge } from '@/actions/employee/badges';
import type { TimePeriod } from '@/lib/utils/time-period-utils';

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
  rank: (period?: TimePeriod | 'current') => 
    period ? [...employeeKeys.all, 'rank', period] as const : [...employeeKeys.all, 'rank'] as const,
  badges: () => [...employeeKeys.all, 'badges'] as const,
  userBadges: (userId: string) => [...employeeKeys.badges(), userId] as const,
};

/**
 * Fetches the current employee's rank among all regular employees
 * Supports time period filtering for historical rankings
 *
 * @param period - Time period filter (current/weekly/monthly/yearly)
 * @param options - Query options (enabled, staleTime, etc.)
 * @returns Query result with EmployeeRank data, loading state, and error handling
 *
 * @example
 * ```tsx
 * function RankWidget() {
 *   const { data: rankData, isLoading, error } = useGetEmployeeRank('current')
 *
 *   if (isLoading) return <Skeleton />
 *   if (error || !rankData) return null
 *
 *   return <div>Rank #{rankData.rank} - Score: {rankData.performanceScore}</div>
 * }
 * ```
 */
export function useGetEmployeeRank(
  period: TimePeriod | 'current' = 'current',
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<EmployeeRank | null, Error> {
  return useQuery({
    queryKey: employeeKeys.rank(period),
    queryFn: async () => {
      const result = await handleFetchEmployeeRank(period);
      return result;
    },
    enabled: queryOptions.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    retry: 1, // Retry once on failure
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  }) as UseQueryResult<EmployeeRank | null, Error>;
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
