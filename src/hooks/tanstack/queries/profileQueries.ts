/**
 * Profile Query Hooks
 * ====================
 * TanStack Query hooks for fetching and managing user profile data.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchUserProfileByIdHandler } from '@/action-handlers/shared/profile';
import type { UserWithExtras } from '@/types';

/**
 * Query key factory for profile-related queries
 * all → base key for all profile queries.
detail(userId) → key for a specific user’s profile, e.g. ['profile','123']
 */

export const profileKeys = {
  all: ['profile'] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
};

/**
 * Fetches user profile by ID
 * 
 * @param userId - The ID of the user to fetch
 * @returns Query result with user profile data
 * 
 * @example
 * ```tsx
 * function ProfilePage({ userId }: { userId: string }) {
 *   const { data: profile, isLoading } = useGetUserProfile(userId);
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!profile) return <div>Profile not found</div>;
 *   
 *   return <div>{profile.name}</div>;
 * }
 * ```
 */
export function useGetUserProfile(
  userId: string
): UseQueryResult<UserWithExtras | null, Error> {
  return useQuery({
    queryKey: profileKeys.detail(userId),
    queryFn: async () => {
      return await fetchUserProfileByIdHandler(userId);
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute (reduced for faster invalidation detection)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: 'always', // Always refetch to ensure fresh data when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}
