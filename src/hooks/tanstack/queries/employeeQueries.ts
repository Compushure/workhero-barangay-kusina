/**
 * Employee Query Hooks
 * ====================
 * TanStack Query hooks for fetching employee-specific data.
 * Provides type-safe, cached queries with automatic refetching capabilities.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  handleFetchEmployeeRank,
  handleFetchEmployeeLevel,
  handleFetchEmployeePoints,
  handleFetchEmployeeXP,
} from '@/action-handlers/employee/stats';
import { fetchUserBadgesHandler } from '@/action-handlers/employee/badges';
import type { EmployeeRank, EmployeeXP, EmployeePointsData } from '@/types';
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
  level: () => [...employeeKeys.all, 'level'] as const,
  points: () => [...employeeKeys.all, 'points'] as const,
  xp: () => [...employeeKeys.all, 'xp'] as const,
  rank: () => [...employeeKeys.all, 'rank'] as const,
  badges: () => [...employeeKeys.all, 'badges'] as const,
  userBadges: (userId: string) => [...employeeKeys.badges(), userId] as const,
};

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

/**
 * Fetches the current employee's level
 * @param options - Query options (enabled, staleTime, etc.)
 * @returns Query result with level number or null on error
 */
export function useGetEmployeeLevel(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<number | null, Error> {
  return useQuery({
    queryKey: employeeKeys.level(),
    queryFn: async () => {
      const result = await handleFetchEmployeeLevel();
      return result;
    },
    enabled: queryOptions.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes - level changes frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<number | null, Error>;
}

/**
 * Fetches the current employee's points data
 * Includes both earned points and deducted points
 * @param options - Query options (enabled, staleTime, etc.)
 * @returns Query result with EmployeePointsData or null on error
 */
export function useGetEmployeePoints(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<EmployeePointsData | null, Error> {
  return useQuery({
    queryKey: employeeKeys.points(),
    queryFn: async () => {
      const result = await handleFetchEmployeePoints();
      return result;
    },
    enabled: queryOptions.enabled !== false,
    staleTime: 1 * 60 * 1000, // 1 minute - points change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<EmployeePointsData | null, Error>;
}

/**
 * Fetches the current employee's XP data
 * Includes current level progress and total XP
 * @param options - Query options (enabled, staleTime, etc.)
 * @returns Query result with EmployeeXP or null on error
 */
export function useGetEmployeeXP(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<EmployeeXP | null, Error> {
  return useQuery({
    queryKey: employeeKeys.xp(),
    queryFn: async () => {
      const result = await handleFetchEmployeeXP();
      return result;
    },
    enabled: queryOptions.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes - XP changes frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<EmployeeXP | null, Error>;
}
