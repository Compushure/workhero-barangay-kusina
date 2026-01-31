/**
 * User Query Hooks
 * =================
 * TanStack Query hooks for fetching user data.
 * Provides type-safe, cached queries with automatic refetching capabilities.
 * Handles search, filtering, sorting, and pagination efficiently.
 */

import { useQuery, keepPreviousData, type UseQueryResult } from '@tanstack/react-query';
import { handleFetchUsers, handleFetchUsersPaginated } from '@/action-handlers/manage';
import { handleFetchSessionUser } from '@/action-handlers/sidebar';
import type { User, UserQueryParams, UserWithExtras, PaginatedResponse } from '@/types';

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
  paginatedLists: () => [...userKeys.all, 'paginated'] as const,
  paginatedList: (filters?: Partial<UserQueryParams>, page?: number) =>
    [...userKeys.paginatedLists(), filters, page] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  session: () => [...userKeys.all, 'session'] as const,
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

/**
 * Fetches the currently logged-in user's session information
 * Used by components like ProfilePic to display user avatar and details
 *
 * @param options - Query options (enabled, staleTime, etc.)
 * @returns Query result with UserWithExtras data, loading state, and error handling
 *
 * @example
 * ```tsx
 * function ProfilePic() {
 *   const { data: user, isLoading, error } = useGetSessionUser()
 *
 *   if (isLoading) return <Skeleton />
 *   if (error || !user) return <User size={24} />
 *
 *   return <img src={user.profilePictureUrl} alt={user.name} />
 * }
 * ```
 */
export function useGetSessionUser(
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<UserWithExtras | null, Error> {
  return useQuery({
    queryKey: userKeys.session(),
    queryFn: async () => {
      const result = await handleFetchSessionUser();

      if (result.error || !result.data) {
        return null;
      }

      return result.data;
    },
    enabled: queryOptions.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  }) as UseQueryResult<UserWithExtras | null, Error>;
}

/**
 * Fetches paginated users with search, filter, and sorting
 * Optimized for list pages that need pagination controls
 *
 * @param params - Filter and search parameters
 * @param page - Page number (1-indexed)
 * @param options - Additional query options (enabled, staleTime, etc.)
 * @returns Query result with paginated users data, loading state, and error handling
 *
 * @example
 * ```tsx
 * function UserListWithPagination() {
 *   const [page, setPage] = useState(1)
 *   const [searchQuery, setSearchQuery] = useState('')
 *   const debouncedQuery = useDebounce(searchQuery, 300)
 *
 *   const { data: { data: users, totalPages } = { data: [], totalPages: 0 }, isLoading } = useGetUsersPaginated(
 *     {
 *       searchQuery: debouncedQuery,
 *       employeeTypeFilter: 'all',
 *       employmentStatusFilter: 'all',
 *       sortBy: 'date-desc',
 *       pageSize: 25,
 *     },
 *     page
 *   )
 *
 *   return (
 *     <>
 *       <UserTable users={users} />
 *       <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
 *     </>
 *   )
 * }
 * ```
 */
export function useGetUsersPaginated(
  params: Partial<UserQueryParams> = {},
  page: number = 1,
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<PaginatedResponse<User>, Error> {
  // Merge with defaults
  const queryParams: UserQueryParams = {
    searchQuery: params.searchQuery ?? '',
    searchType: params.searchType ?? 'name',
    employeeTypeFilter: params.employeeTypeFilter ?? 'all',
    employmentStatusFilter: params.employmentStatusFilter ?? 'all',
    sortBy: params.sortBy ?? 'date-desc',
    page: page,
    pageSize: params.pageSize ?? 25,
  };

  return useQuery({
    queryKey: userKeys.paginatedList(queryParams, page),
    queryFn: async () => {
      const result = await handleFetchUsersPaginated(queryParams);
      return result;
    },
    enabled: queryOptions.enabled !== false && page >= 1,
    staleTime: 5 * 60 * 1000, // 5 minutes to reduce refetches
    gcTime: 15 * 60 * 1000, // 15 minutes cache retention
    retry: 1,
    placeholderData: keepPreviousData, // keep previous page/filter data to avoid blank states
  }) as UseQueryResult<PaginatedResponse<User>, Error>;
}

