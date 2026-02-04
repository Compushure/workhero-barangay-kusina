/**
 * Task Category Query Hooks
 * ==========================
 * TanStack Query hooks for fetching task category data.
 * Provides type-safe, cached queries with sorting, filtering, and search capabilities.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { handleFetchTaskCategories } from '@/action-handlers/manager-editor';
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
  details: () => [...taskCategoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskCategoryKeys.details(), id] as const,
};

/**
 * Sort and filter task categories based on query parameters
 */
function sortAndFilterCategories(
  categories: TaskCategory[],
  params?: TaskCategoryQueryParams
): TaskCategory[] {
  let filtered = [...categories];

  // Apply search filter
  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      (cat) =>
        cat.name.toLowerCase().includes(searchLower) ||
        cat.description.toLowerCase().includes(searchLower) ||
        cat.type.toLowerCase().includes(searchLower)
    );
  }

  // Apply type filter
  if (params?.filterType && params.filterType !== 'all') {
    filtered = filtered.filter((cat) => cat.type === params.filterType);
  }

  // Apply sorting
  switch (params?.sort) {
    case 'type-name':
      filtered.sort((a, b) => {
        const typeCompare = a.type.localeCompare(b.type);
        if (typeCompare !== 0) return typeCompare;
        return a.name.localeCompare(b.name);
      });
      break;

    case 'recently-created':
      // Assuming newer items come last from DB, reverse the array
      filtered.reverse();
      break;

    case 'points-desc':
      filtered.sort((a, b) => b.points - a.points);
      break;

    case 'xp-desc':
      filtered.sort((a, b) => b.xp - a.xp);
      break;

    case 'repeatable-only':
      filtered = filtered.filter((cat) => cat.isRepeatable);
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;

    case 'non-repeatable-only':
      filtered = filtered.filter((cat) => !cat.isRepeatable);
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;

    default:
      // Default: sort by type then name
      filtered.sort((a, b) => {
        const typeCompare = a.type.localeCompare(b.type);
        if (typeCompare !== 0) return typeCompare;
        return a.name.localeCompare(b.name);
      });
  }

  return filtered;
}

/**
 * Fetches all task categories with optional sorting and filtering
 *
 * @param params - Query parameters for search, filter, and sort
 * @param queryOptions - Additional query options (enabled, staleTime, etc.)
 * @returns Query result with task categories array, loading state, and error handling
 *
 * @example
 * ```tsx
 * function TaskCategoryList() {
 *   const { data: categories, isLoading, error } = useGetTaskCategories({
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
 *       {categories?.map(cat => <li key={cat.id}>{cat.name}</li>)}
 *     </ul>
 *   )
 * }
 * ```
 */
export function useGetTaskCategories(
  params?: TaskCategoryQueryParams,
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<TaskCategory[], Error> {
  return useQuery({
    queryKey: taskCategoryKeys.list(params),
    queryFn: async () => {
      const categories = await handleFetchTaskCategories();
      return sortAndFilterCategories(categories, params);
    },
    enabled: queryOptions.enabled !== false,
    staleTime: 30 * 1000, // 30 seconds - categories don't change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: true,
  }) as UseQueryResult<TaskCategory[], Error>;
}

/**
 * Get unique task types from all categories
 * Helper hook for filter dropdowns
 *
 * @example
 * ```tsx
 * function TaskTypeFilter() {
 *   const { data: types } = useGetTaskTypes()
 *   return (
 *     <select>
 *       <option value="all">All Types</option>
 *       {types?.map(type => <option key={type} value={type}>{type}</option>)}
 *     </select>
 *   )
 * }
 * ```
 */
export function useGetTaskTypes(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<string[], Error> {
  return useQuery({
    queryKey: [...taskCategoryKeys.all, 'types'],
    queryFn: async () => {
      const categories = await handleFetchTaskCategories();
      const types = [...new Set(categories.map((cat) => cat.type))];
      return types.sort();
    },
    enabled: queryOptions.enabled !== false,
    staleTime: 60 * 1000, // 1 minute - types rarely change
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  }) as UseQueryResult<string[], Error>;
}
