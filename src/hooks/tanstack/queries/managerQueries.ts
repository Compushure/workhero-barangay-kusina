/**
 * Manager Task Query Hooks
 * =========================
 * TanStack Query hooks for fetching manager task verification data.
 * Provides type-safe, cached queries with automatic refetching capabilities.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  handleFetchTasksToReview,
  handleFetchApprovedTasks,
  handleFetchDeniedTasks,
  handleFetchTasksToReviewPaginated,
  handleFetchApprovedTasksPaginated,
  handleFetchDeniedTasksPaginated,
} from '@/action-handlers/manager';
import type { VerificationRequest } from '@/types/manager-verification-req';
import type { PaginatedResponse } from '@/actions/manager';

/**
 * Query key factory for manager task-related queries
 * Centralizes query key management for consistency and cache invalidation
 *
 * @example
 * // Invalidate all task queries
 * queryClient.invalidateQueries({ queryKey: managerTaskKeys.all })
 */
export const managerTaskKeys = {
  all: ['manager-tasks'] as const,
  lists: () => [...managerTaskKeys.all, 'list'] as const,
  list: (status?: string, page?: number) => [...managerTaskKeys.lists(), status, page] as const,
  paginatedLists: () => [...managerTaskKeys.all, 'paginated'] as const,
  paginatedList: (status: string, page: number) =>
    [...managerTaskKeys.paginatedLists(), status, page] as const,
  details: () => [...managerTaskKeys.all, 'detail'] as const,
  detail: (id: string) => [...managerTaskKeys.details(), id] as const,
};

/**
 * Fetches tasks pending review/verification
 *
 * @param queryOptions - Additional query options (enabled, staleTime, etc.)
 * @returns Query result with tasks array, loading state, and error handling
 *
 * @example
 * ```tsx
 * function TaskVerificationPage() {
 *   const { data: tasks, isLoading, error, refetch } = useGetTasksToReview()
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *
 *   return (
 *     <ul>
 *       {tasks?.map(task => <li key={task.kpitask_id}>{task.assigned_to_name}</li>)}
 *     </ul>
 *   )
 * }
 * ```
 */
export function useGetTasksToReview(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<VerificationRequest[], Error> {
  return useQuery({
    queryKey: managerTaskKeys.list('in review'),
    queryFn: async () => {
      const tasks = await handleFetchTasksToReview();
      return tasks;
    },
    enabled: queryOptions.enabled !== false,
    staleTime: 30 * 1000, // 30 seconds - tasks change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  }) as UseQueryResult<VerificationRequest[], Error>;
}

/**
 * Fetches paginated tasks in review
 *
 * @param page - Page number (1-indexed)
 * @param queryOptions - Additional query options (enabled, staleTime, etc.)
 * @returns Query result with paginated data, loading state, and error handling
 */
export function useGetTasksToReviewPaginated(
  page: number = 1,
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<PaginatedResponse<VerificationRequest>, Error> {
  return useQuery({
    queryKey: managerTaskKeys.paginatedList('in-review', page),
    queryFn: async () => {
      const response = await handleFetchTasksToReviewPaginated(page);
      return response;
    },
    enabled: queryOptions.enabled !== false && page >= 1,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<PaginatedResponse<VerificationRequest>, Error>;
}

/**
 * Fetches approved tasks
 *
 * @param queryOptions - Additional query options (enabled, staleTime, etc.)
 * @returns Query result with approved tasks array, loading state, and error handling
 */
export function useGetApprovedTasks(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<VerificationRequest[], Error> {
  return useQuery({
    queryKey: managerTaskKeys.list('approved'),
    queryFn: async () => {
      const tasks = await handleFetchApprovedTasks();
      return tasks;
    },
    enabled: queryOptions.enabled !== false,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<VerificationRequest[], Error>;
}

/**
 * Fetches paginated approved tasks
 *
 * @param page - Page number (1-indexed)
 * @param queryOptions - Additional query options (enabled, staleTime, etc.)
 * @returns Query result with paginated data, loading state, and error handling
 */
export function useGetApprovedTasksPaginated(
  page: number = 1,
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<PaginatedResponse<VerificationRequest>, Error> {
  return useQuery({
    queryKey: managerTaskKeys.paginatedList('approved', page),
    queryFn: async () => {
      const response = await handleFetchApprovedTasksPaginated(page);
      return response;
    },
    enabled: queryOptions.enabled !== false && page >= 1,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<PaginatedResponse<VerificationRequest>, Error>;
}

/**
 * Fetches denied/rejected tasks
 *
 * @param queryOptions - Additional query options (enabled, staleTime, etc.)
 * @returns Query result with denied tasks array, loading state, and error handling
 */
export function useGetDeniedTasks(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<VerificationRequest[], Error> {
  return useQuery({
    queryKey: managerTaskKeys.list('rejected'),
    queryFn: async () => {
      const tasks = await handleFetchDeniedTasks();
      return tasks;
    },
    enabled: queryOptions.enabled !== false,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<VerificationRequest[], Error>;
}

/**
 * Fetches paginated denied/rejected tasks
 *
 * @param page - Page number (1-indexed)
 * @param queryOptions - Additional query options (enabled, staleTime, etc.)
 * @returns Query result with paginated data, loading state, and error handling
 */
export function useGetDeniedTasksPaginated(
  page: number = 1,
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<PaginatedResponse<VerificationRequest>, Error> {
  return useQuery({
    queryKey: managerTaskKeys.paginatedList('rejected', page),
    queryFn: async () => {
      const response = await handleFetchDeniedTasksPaginated(page);
      return response;
    },
    enabled: queryOptions.enabled !== false && page >= 1,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<PaginatedResponse<VerificationRequest>, Error>;
}
