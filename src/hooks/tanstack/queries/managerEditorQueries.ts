/**
 * Task Category Query Hooks
 * ==========================
 * TanStack Query hooks for fetching task category data.
 * Provides type-safe, cached queries with sorting, filtering, and search capabilities.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  handleFetchTaskCategoriesPaginated,
  handleFetchTaskCategoryMetadata,
} from '@/action-handlers/manager/editor';
import type { TaskCategory } from '@/types/manager/task-editor';

export type TaskCategorySortOption =
  | 'type-name'
  | 'recently-created'
  | 'points-desc'
  | 'xp-desc'
  | 'repeatable-only'
  | 'non-repeatable-only';

export interface TaskCategoryQueryParams {
  search?: string;
  filterType?: string;
  sort?: TaskCategorySortOption;
}

/**
 * Query key factory for task category-related queries
 * Centralizes query key management for consistency and cache invalidation
 *
 * @example
 * // Invalidate all task category queries
 * queryClient.invalidateQueries({ queryKey: taskCategoryKeys.all })
 */
export const taskCategoryKeys = {
  all: ['task-categories'] as const,
  lists: () => [...taskCategoryKeys.all, 'list'] as const,
  list: (params?: TaskCategoryQueryParams) => [...taskCategoryKeys.lists(), params] as const,
  paginatedList: (page: number, pageSize: number, sortBy: string, searchTerm: string) =>
    [...taskCategoryKeys.all, 'paginated', { page, pageSize, sortBy, searchTerm }] as const,
  details: () => [...taskCategoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskCategoryKeys.details(), id] as const,
};

/**
 * Fetches paginated task categories with optional sorting and filtering
 *
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page
 * @param sortBy - Sort order option
 * @param searchTerm - Search filter term
 * @param queryOptions - Additional query options (enabled, staleTime, etc.)
 * @returns Query result with paginated task categories, loading state, and error handling
 *
 * @example
 * ```tsx
 * function TaskCategoryList() {
 *   const { data: paginatedData, isLoading, error } = useGetTaskCategoriesPaginated({
 *     page: 1,
 *     pageSize: 10,
 *     search: 'clean',
 *     filterType: 'daily',
 *     sort: 'points-desc'
 *   })
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *
 *   return (
 *     <ul>
 *       {paginatedData?.tasks?.map(cat => <li key={cat.id}>{cat.name}</li>)}
 *     </ul>
 *   )
 * }
 * ```
 */
export function useGetTaskCategoriesPaginated(
  page: number = 1,
  pageSize: number = 10,
  sortBy: string = 'type-name',
  searchTerm: string = '',
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<
  { tasks: TaskCategory[]; count: number; totalPages: number },
  Error
> {
  return useQuery({
    queryKey: taskCategoryKeys.paginatedList(page, pageSize, sortBy, searchTerm),
    queryFn: async () => {
      return await handleFetchTaskCategoriesPaginated(page, pageSize, sortBy, searchTerm);
    },
    enabled: queryOptions.enabled !== false,
    staleTime: 30 * 1000, // 30 seconds - avoid frequent refetch churn
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  }) as UseQueryResult<
    { tasks: TaskCategory[]; count: number; totalPages: number },
    Error
  >;
}

export function useGetTaskTypes(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<string[], Error> {
  return useQuery({
    queryKey: [...taskCategoryKeys.all, 'types'],
    queryFn: async () => {
      // Use the main paginated fetch function with large page size to get all categories
      const result = await handleFetchTaskCategoriesPaginated(1, 1000, 'type-name', '');
      const types = [...new Set(result.tasks.map((cat) => cat.type))];
      return types.sort();
    },
    enabled: queryOptions.enabled !== false,
    staleTime: 60 * 1000, // 1 minute - types rarely change
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  }) as UseQueryResult<string[], Error>;
}

export function useGetTaskCategoryMetadata(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<{ names: string[]; types: string[] }, Error> {
  return useQuery({
    queryKey: [...taskCategoryKeys.all, 'metadata'],
    queryFn: async () => handleFetchTaskCategoryMetadata(),
    enabled: queryOptions.enabled !== false,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  }) as UseQueryResult<{ names: string[]; types: string[] }, Error>;
}

