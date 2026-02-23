/**
 * Profile Mutation Hooks
 * =======================
 * TanStack Query mutation hooks for profile update operations.
 * Handles cache invalidation and error handling.
 */

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import {
  updateOwnProfileHandler,
  uploadOwnProfilePictureHandler,
  deleteOwnProfilePictureHandler,
} from '@/action-handlers/shared/profile';
import { profileKeys } from '../queries/profileQueries';
import { userKeys } from '../queries/userQueries';

/**
 * Updates current user's own profile
 * 
 * @returns Mutation object with mutate/mutateAsync functions
 * 
 * @example
 * ```tsx
 * function EditProfileForm({ userId }: { userId: string }) {
 *   const updateProfile = useUpdateOwnProfile(userId);
 *   
 *   const handleSubmit = (data) => {
 *     updateProfile.mutate(data, {
 *       onSuccess: () => {
 *         console.log('Profile updated');
 *       }
 *     });
 *   };
 *   
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useUpdateOwnProfile(userId: string): UseMutationResult<
  unknown,
  Error,
  {
    name?: string;
    contactNumber?: string;
    address?: string;
  }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: {
      name?: string;
      contactNumber?: string;
      address?: string;
    }) => {
      return await updateOwnProfileHandler(profileData);
    },
    onSuccess: () => {
      // Invalidate profile cache for this user
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
      // Also invalidate session user cache
      queryClient.invalidateQueries({ queryKey: userKeys.session() });
    },
  });
}

/**
 * Uploads profile picture for current user
 * 
 * @returns Mutation object with mutate/mutateAsync functions
 * 
 * @example
 * ```tsx
 * function ProfilePictureUpload({ userId }: { userId: string }) {
 *   const uploadPicture = useUploadOwnProfilePicture(userId);
 *   
 *   const handleFileChange = (file: File) => {
 *     uploadPicture.mutate(file);
 *   };
 *   
 *   return <input type="file" onChange={(e) => handleFileChange(e.target.files[0])} />;
 * }
 * ```
 */
export function useUploadOwnProfilePicture(userId: string): UseMutationResult<
  unknown,
  Error,
  File
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      return await uploadOwnProfilePictureHandler(file);
    },
    onMutate: async (file: File) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: profileKeys.detail(userId) });

      // Optimistically dispatch event to show preview immediately
      const tempUrl = URL.createObjectURL(file);
      window.dispatchEvent(
        new CustomEvent('profile-image-updated', {
          detail: { userId, timestamp: Date.now(), tempUrl },
        })
      );

      // Return context for rollback
      return { tempUrl };
    },
    onSuccess: () => {
      // Invalidate profile cache for this user
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
      // Also invalidate session user cache to update sidebar
      queryClient.invalidateQueries({ queryKey: userKeys.session() });
      // Invalidate all user queries to update any user lists
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      // Dispatch event with actual timestamp
      window.dispatchEvent(
        new CustomEvent('profile-image-updated', {
          detail: { userId, timestamp: Date.now() },
        })
      );
    },
    onError: (_error, _file, context) => {
      // Rollback optimistic update
      if (context?.tempUrl) {
        URL.revokeObjectURL(context.tempUrl);
        // Dispatch deletion event to revert to previous state
        window.dispatchEvent(
          new CustomEvent('profile-image-deleted', {
            detail: { userId, timestamp: Date.now() },
          })
        );
      }
    },
  });
}

/**
 * Deletes profile picture for current user
 * 
 * @returns Mutation object with mutate/mutateAsync functions
 * 
 * @example
 * ```tsx
 * function ProfilePictureDelete({ userId }: { userId: string }) {
 *   const deletePicture = useDeleteOwnProfilePicture(userId);
 *   
 *   const handleDelete = () => {
 *     deletePicture.mutate();
 *   };
 *   
 *   return <button onClick={handleDelete}>Remove Picture</button>;
 * }
 * ```
 */
export function useDeleteOwnProfilePicture(userId: string): UseMutationResult<
  void,
  Error,
  void
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const success = await deleteOwnProfilePictureHandler();
      if (!success) {
        throw new Error('Failed to delete profile picture');
      }
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: profileKeys.detail(userId) });

      // Optimistically dispatch deletion event
      window.dispatchEvent(
        new CustomEvent('profile-image-deleted', {
          detail: { userId, timestamp: Date.now() },
        })
      );

      // Snapshot previous state for rollback
      const previousProfile = queryClient.getQueryData(profileKeys.detail(userId));
      return { previousProfile };
    },
    onSuccess: () => {
      // Invalidate profile cache for this user
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
      // Also invalidate session user cache to update sidebar
      queryClient.invalidateQueries({ queryKey: userKeys.session() });
      // Invalidate all user queries to update any user lists
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      // Dispatch confirmed deletion event
      window.dispatchEvent(
        new CustomEvent('profile-image-deleted', {
          detail: { userId, timestamp: Date.now() },
        })
      );
      // Force immediate refetch to ensure modal gets fresh data
      queryClient.refetchQueries({ queryKey: profileKeys.detail(userId) });
    },
    onError: (_error, _variables, context) => {
      // Rollback optimistic update
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.detail(userId), context.previousProfile);
        // Dispatch update event to restore previous state
        window.dispatchEvent(
          new CustomEvent('profile-image-updated', {
            detail: { userId, timestamp: Date.now() },
          })
        );
      }
    },
  });
}
