/**
 * Employee Tasks TanStack Queries
 * ===============================
 * React Query hooks for employee task operations.
 * Provides caching, loading states, and automatic refetching.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { handleFetchEmployeeTasks } from '@/action-handlers/employee/tasks';
import type { EmployeeTasksData } from '@/actions/employee/tasks';

// Query keys for cache management
export const employeeTasksKeys = {
  all: ['employeeTasks'] as const,
  lists: () => [...employeeTasksKeys.all, 'list'] as const,
  list: () => [...employeeTasksKeys.lists(), 'data'] as const,
} as const;

/**
 * Hook to fetch all tasks for the current employee
 * Provides cached data with loading and error states
 */
export function useGetEmployeeTasks(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<EmployeeTasksData, Error> {
  return useQuery({
    queryKey: employeeTasksKeys.list(),
    queryFn: async () => {
      return await handleFetchEmployeeTasks();
    },
    enabled: queryOptions.enabled !== false,
    staleTime: 10 * 1000, // 10 seconds - tasks change frequently during work
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: true,
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes for real-time updates
  }) as UseQueryResult<EmployeeTasksData, Error>;
}
