/**
 * Delete Profile Picture Mutation
 * =================================
 * TanStack Query mutation for removing user profile pictures
 */

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { handleDeleteProfilePicture } from '@/action-handlers/manage-delete-profile';
import { userKeys } from '../queries/userQueries';

/**
 * Hook for deleting user profile pictures
 * Automatically invalidates user queries on success
 */
export function useDeleteProfilePicture(): UseMutationResult<
  boolean,
  Error,
  { userId: string; userName: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      userName 
    }: { 
      userId: string; 
      userName: string 
    }): Promise<boolean> => {
      return await handleDeleteProfilePicture(userId, userName);
    },
    onSuccess: () => {
      // Invalidate all user queries to refresh cache
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => {
      console.error('Error deleting profile picture:', error);
      // Error toast handled by action-handler
    },
  });
}
