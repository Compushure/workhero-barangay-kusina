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
} from '@/action-handlers/profile';
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
    onSuccess: () => {
      // Invalidate profile cache for this user
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
      // Also invalidate session user cache to update sidebar
      queryClient.invalidateQueries({ queryKey: userKeys.session() });
      // Invalidate all user queries to update any user lists
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
