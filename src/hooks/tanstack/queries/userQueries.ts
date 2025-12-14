/**
 * User Query Hooks
 * =================
 * TanStack Query hooks for fetching user data.
 * Provides type-safe, cached queries with automatic refetching capabilities.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { handleFetchUsers } from '@/action-handlers/manage';
import type { User } from '@/types';

/**
 * Query key factory for user-related queries
 * Centralizes query key management for consistency and cache invalidation
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

/**
 * Fetches all users from the database
 * @returns Query result with users array, loading state, and error handling
 *
 * @example
 * ```tsx
 * function UserList() {
 *   const { data: users, isLoading, error } = useGetUsers()
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
export function useGetUsers(): UseQueryResult<User[], Error> {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: async () => {
      // Use action-handler which includes safeAction wrapper and error handling
      const users = await handleFetchUsers();
      return users;
    },
    // Refetch on mount to ensure fresh data
    refetchOnMount: true,
    // Keep data fresh for 2 minutes before considering stale
    staleTime: 2 * 60 * 1000,
  });
}
