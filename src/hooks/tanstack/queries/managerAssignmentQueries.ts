/**
 * Manager Task Assignment Query Hooks
 * ====================================
 * TanStack Query hooks for fetching manager task assignment data.
 * Provides type-safe, cached queries with automatic refetching capabilities.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  handleFetchCurrentAssignedTasksPaginated,
  handleFetchCurrentAssignedEmployeesPaginated,
} from '@/action-handlers/manager-current-assigned-task';
import type { AssignedTask } from '@/types';

/**
 * Query key factory for manager task assignment queries
 * Centralizes query key management for consistency and cache invalidation
 */
export const managerAssignmentKeys = {
  all: ['manager-assignments'] as const,
  tasks: () => [...managerAssignmentKeys.all, 'tasks'] as const,
  taskList: (page: number, pageSize: number, sortBy: string, searchTerm: string) =>
    [...managerAssignmentKeys.tasks(), { page, pageSize, sortBy, searchTerm }] as const,
  employees: () => [...managerAssignmentKeys.all, 'employees'] as const,
  employeeList: (page: number, pageSize: number, sortBy: string, searchTerm: string) =>
    [...managerAssignmentKeys.employees(), { page, pageSize, sortBy, searchTerm }] as const,
};

/**
 * Fetches paginated current assigned tasks with memoization
 *
 * @param page - Page number (1-indexed)
 * @param sortBy - Sort order option
 * @param searchTerm - Search filter term
 * @param enabled - Whether to enable this query (default: true)
 * @returns Query result with paginated tasks, loading state, and error handling
 */
export function useGetCurrentAssignedTasksPaginated(
  page: number = 1,
  pageSize: number = 4,
  sortBy: string = 'recently added',
  searchTerm: string = '',
  enabled: boolean = true
): UseQueryResult<
  { tasks: AssignedTask[]; count: number; totalPages: number },
  Error
> {
  return useQuery({
    queryKey: managerAssignmentKeys.taskList(page, pageSize, sortBy, searchTerm),
    queryFn: async () => {
      return await handleFetchCurrentAssignedTasksPaginated(
        page,
        pageSize,
        sortBy,
        searchTerm
      );
    },
    enabled: enabled && page >= 1,
    staleTime: 30 * 1000, // 30 seconds - tasks don't change that frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<
    { tasks: AssignedTask[]; count: number; totalPages: number },
    Error
  >;
}

/**
 * Fetches paginated current assigned tasks grouped by employee
 *
 * @param page - Page number (1-indexed)
 * @param sortBy - Sort order option
 * @param searchTerm - Search filter term
 * @param enabled - Whether to enable this query (default: true)
 * @returns Query result with paginated employee tasks, loading state, and error handling
 */
export function useGetCurrentAssignedEmployeesPaginated(
  page: number = 1,
  pageSize: number = 4,
  sortBy: string = 'recently added',
  searchTerm: string = '',
  enabled: boolean = true
): UseQueryResult<
  { tasks: AssignedTask[]; count: number; totalPages: number },
  Error
> {
  return useQuery({
    queryKey: managerAssignmentKeys.employeeList(page, pageSize, sortBy, searchTerm),
    queryFn: async () => {
      return await handleFetchCurrentAssignedEmployeesPaginated(
        page,
        pageSize,
        sortBy,
        searchTerm
      );
    },
    enabled: enabled && page >= 1,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<
    { tasks: AssignedTask[]; count: number; totalPages: number },
    Error
  >;
}
