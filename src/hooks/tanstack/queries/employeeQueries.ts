/**
 * Employee Query Hooks
 * ====================
 * TanStack Query hooks for fetching employee-specific data.
 * Provides type-safe, cached queries with automatic refetching capabilities.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { handleFetchEmployeeRank } from '@/action-handlers/employee/stats';
import type { EmployeeRank } from '@/types';

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
