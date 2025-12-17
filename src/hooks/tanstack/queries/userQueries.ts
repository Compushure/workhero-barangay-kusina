/**
 * User Query Hooks
 * =================
 * TanStack Query hooks for fetching user data.
 * Provides type-safe, cached queries with automatic refetching capabilities.
 * Handles search, filtering, sorting, and pagination efficiently.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { handleFetchUsers } from '@/action-handlers/manage';
import type { User, UserQueryParams } from '@/types';

/**
 * Query key factory for user-related queries
 * Centralizes query key management for consistency and cache invalidation
 *
 * @example
 * // Invalidate all user queries
 * queryClient.invalidateQueries({ queryKey: userKeys.all })
 *
 * // Invalidate filtered list
 * queryClient.invalidateQueries({ queryKey: userKeys.list(filters) })
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: Partial<UserQueryParams>) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

/**
 * Fetches users with search, filter, and pagination
 * Automatically debounced via debouncedQuery from parent component
 *
 * @param params - Filter and search parameters (should be debounced)
 * @param options - Additional query options (enabled, staleTime, etc.)
 * @returns Query result with users array, loading state, and error handling
 *
 * @example
 * ```tsx
 * function UserList() {
 *   const [searchQuery, setSearchQuery] = useState('')
 *   const debouncedQuery = useDebounce(searchQuery, 300)
 *
 *   const { data: users, isLoading, error } = useGetUsers({
 *     searchQuery: debouncedQuery,
 *     searchType: 'name',
 *     employeeTypeFilter: 'all',
 *     employmentStatusFilter: 'all',
 *     sortBy: 'date-desc',
 *     page: 1,
 *     pageSize: 25,
 *   })
 *
 *   if (isLoading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *
 *   return (
 *     <ul>
 *       {users?.map(user => <li key={user.id}>{user.name}</li>)}
 *     </ul>
 *   )
 * }
 * ```
 */
export function useGetUsers(
  params: Partial<UserQueryParams> = {},
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<User[], Error> {
  // Merge with defaults
  const queryParams: UserQueryParams = {
    searchQuery: params.searchQuery ?? '',
    searchType: params.searchType ?? 'name',
    employeeTypeFilter: params.employeeTypeFilter ?? 'all',
    employmentStatusFilter: params.employmentStatusFilter ?? 'all',
    sortBy: params.sortBy ?? 'date-desc', // Default sort
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 25,
  };

  return useQuery({
    queryKey: userKeys.list(queryParams),
    queryFn: async () => {
      const users = await handleFetchUsers(queryParams);
      return users;
    },
    enabled: queryOptions.enabled !== false, // Allow disabling the query
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 1, // Retry once on failure
  }) as UseQueryResult<User[], Error>;
}
