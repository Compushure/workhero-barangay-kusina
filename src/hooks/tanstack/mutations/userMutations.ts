/**
 * User Mutation Hooks
 * ====================
 * TanStack Query mutation hooks for user CRUD operations.
 * Handles optimistic updates, cache invalidation, and error handling.
 */

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import {
  handleAddUser,
  handleEditUser,
  handleDeleteUser,
  handleUploadProfilePicture,
  handleDeleteProfilePicture,
} from '@/action-handlers/superadmin/users';
import type { User, AddUserInput, EditUserInput } from '@/types';
import { userKeys } from '../queries/userQueries';
import { buildOptimisticUser, useAdminUserStore } from '@/store/adminUserStore';

/**
 * Creates a new user with automatic cache invalidation
 *
 * @returns Mutation object with mutate/mutateAsync functions
 *
 * @example
 * ```tsx
 * function AddUserForm() {
 *   const addUser = useAddUser()
 *
 *   const handleSubmit = (data: AddUserInput) => {
 *     addUser.mutate(data, {
 *       onSuccess: (user) => {
 *         console.log('User added:', user)
 *       }
 *     })
 *   }
 *
 *   return <form onSubmit={handleSubmit}>...</form>
 * }
 * ```
 */
export function useUploadProfilePicture() {
  const queryClient = useQueryClient();
  const { startOptimistic, optimisticSetProfilePicture, rollback, commit } = useAdminUserStore();
  return useMutation<string | null, Error, { file: File; userid: string; username: string }>({
    mutationFn: async ({ file, userid, username }): Promise<string | null> => {
      // Use action-handler which returns the public URL
      return await handleUploadProfilePicture(username, userid, file);
    },
    onMutate: ({ userid }) => {
      startOptimistic();
      optimisticSetProfilePicture(userid, '/assets/default-profile.png');
    },
    onSuccess: (publicUrl, variables) => {
      if (publicUrl) {
        optimisticSetProfilePicture(variables.userid, publicUrl);
      }
      commit();
      queryClient.invalidateQueries({ queryKey: userKeys.paginatedLists() });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: () => {
      rollback();
    },
  });
}

export function useDeleteProfilePicture() {
  const queryClient = useQueryClient();
  const { startOptimistic, optimisticSetProfilePicture, rollback, commit } = useAdminUserStore();
  return useMutation<void, Error, { userId: string; userName: string }>({
    mutationFn: async ({ userId, userName }): Promise<void> => {
      const success = await handleDeleteProfilePicture(userId, userName);
      if (!success) {
        throw new Error('Failed to delete profile picture');
      }
    },
    onMutate: ({ userId }) => {
      startOptimistic();
      optimisticSetProfilePicture(userId, null);
    },
    onSuccess: (_, { userId }) => {
      commit();
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      window.dispatchEvent(
        new CustomEvent('profile-image-deleted', {
          detail: { userId, timestamp: Date.now() },
        })
      );
    },
    onError: () => {
      rollback();
    },
  });
}

export function useAddUser(): UseMutationResult<User, Error, AddUserInput, { tempId: string }> {
  const queryClient = useQueryClient();
  const {
    startOptimistic,
    optimisticPrependUser,
    optimisticReplaceUser,
    rollback,
    commit,
  } = useAdminUserStore();

  return useMutation({
    mutationFn: async (input: AddUserInput): Promise<User> => {
      // Use action-handler which includes safeAction wrapper and toast handling
      const user = await handleAddUser(input);

      if (!user) {
        throw new Error('Failed to create user');
      }

      return user;
    },
    onMutate: async (input: AddUserInput) => {
      await queryClient.cancelQueries({ queryKey: userKeys.all });

      startOptimistic();
      const tempUser = buildOptimisticUser(input);
      optimisticPrependUser(tempUser);

      return { tempId: tempUser.id };
    },
    onSuccess: (user, _input, context) => {
      if (context?.tempId) {
        optimisticReplaceUser(context.tempId, user);
      }
      commit();
      queryClient.invalidateQueries({ queryKey: userKeys.paginatedLists() });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: () => {
      rollback();
    },
  });
}

/**
 * Updates an existing user with automatic cache invalidation
 *
 * @returns Mutation object with mutate/mutateAsync functions
 *
 * @example
 * ```tsx
 * function EditUserForm({ userId }: { userId: string }) {
 *   const editUser = useEditUser()
 *
 *   const handleSubmit = (data: EditUserInput) => {
 *     editUser.mutate(
 *       { userId, data },
 *       {
 *         onSuccess: () => {
 *           // Close modal, etc.
 *         }
 *       }
 *     )
 *   }
 *
 *   return <form onSubmit={handleSubmit}>...</form>
 * }
 * ```
 */
export function useEditUser(): UseMutationResult<
  User,
  Error,
  { userId: string; data: EditUserInput; userName: string },
  { previousUsers: User[] | undefined }
> {
  const queryClient = useQueryClient();
  const { startOptimistic, optimisticUpdateUser, rollback, commit } = useAdminUserStore();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
      userName,
    }: {
      userId: string;
      data: EditUserInput;
      userName: string;
    }): Promise<User> => {
      // Use action-handler which includes safeAction wrapper and toast handling
      const user = await handleEditUser(userId, data, userName);

      if (!user) {
        throw new Error('Failed to update user');
      }

      return user;
    },
    onMutate: async ({ userId, data }) => {
      await queryClient.cancelQueries({ queryKey: userKeys.all });
      startOptimistic();
      optimisticUpdateUser(userId, data);

      return { previousUsers: undefined };
    },
    onSuccess: () => {
      commit();
      queryClient.invalidateQueries({ queryKey: userKeys.paginatedLists() });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: () => {
      rollback();
    },
  });
}

/**
 * Deletes a user with automatic cache invalidation
 *
 * @returns Mutation object with mutate/mutateAsync functions
 *
 * @example
 * ```tsx
 * function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
 *   const deleteUser = useDeleteUser()
 *
 *   const handleDelete = () => {
 *     deleteUser.mutate(
 *       { userId, userName },
 *       {
 *         onSuccess: () => {
 *           console.log('User deleted')
 *         }
 *       }
 *     )
 *   }
 *
 *   return <button onClick={handleDelete}>Delete</button>
 * }
 * ```
 */
export function useDeleteUser(): UseMutationResult<
  void,
  Error,
  { userId: string; userName: string },
  { previousUsers: User[] | undefined }
> {
  const queryClient = useQueryClient();
  const { startOptimistic, optimisticDeleteUser, rollback, commit } = useAdminUserStore();

  return useMutation({
    mutationFn: async ({
      userId,
      userName,
    }: {
      userId: string;
      userName: string;
    }): Promise<void> => {
      // Use action-handler which includes safeAction wrapper and toast handling
      const success = await handleDeleteUser(userId, userName);

      if (!success) {
        throw new Error('Failed to delete user');
      }
    },
    onMutate: async ({ userId }) => {
      await queryClient.cancelQueries({ queryKey: userKeys.all });
      startOptimistic();
      optimisticDeleteUser(userId);
      return { previousUsers: undefined };
    },
    onSuccess: () => {
      commit();
      queryClient.invalidateQueries({ queryKey: userKeys.paginatedLists() });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: () => {
      rollback();
    },
  });
}
