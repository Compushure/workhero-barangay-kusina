/**
 * User Mutation Hooks
 * ====================
 * TanStack Query mutation hooks for user CRUD operations.
 * Handles optimistic updates, cache invalidation, and error handling.
 */

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { handleAddUser, handleEditUser, handleDeleteUser } from '@/action-handlers/manage';
import type { User, AddUserInput, EditUserInput } from '@/types';
import { userKeys } from '../queries/userQueries';

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
export function useAddUser(): UseMutationResult<User, Error, AddUserInput, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddUserInput): Promise<User> => {
      // Use action-handler which includes safeAction wrapper and toast handling
      const user = await handleAddUser(input);

      if (!user) {
        throw new Error('Failed to create user');
      }

      return user;
    },
    onSuccess: () => {
      // Invalidate users query to trigger refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Toast is handled by action-handler
    },
    onError: () => {
      // Error toast is handled by action-handler
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
    // Optimistic update: immediately update cache before server response
    onMutate: async ({ userId, data }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: userKeys.lists() });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData<User[]>(userKeys.lists());

      // Optimistically update cache
      queryClient.setQueryData<User[]>(userKeys.lists(), (old) => {
        if (!old) return old;
        return old.map((user) =>
          user.id === userId
            ? {
                ...user,
                ...(data.name && { name: data.name }),
                ...(data.employeeType &&
                  data.employeeType !== 'no-change' && {
                    employeeType: data.employeeType,
                  }),
              }
            : user
        );
      });

      return { previousUsers };
    },
    onSuccess: () => {
      // Invalidate to ensure server state is reflected
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Toast is handled by action-handler
    },
    onError: (_error, _variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousUsers) {
        queryClient.setQueryData(userKeys.lists(), context.previousUsers);
      }
      // Error toast is handled by action-handler
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
    // Optimistic update: immediately remove from cache
    onMutate: async ({ userId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.lists() });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData<User[]>(userKeys.lists());

      // Optimistically remove user from cache
      queryClient.setQueryData<User[]>(userKeys.lists(), (old) => {
        if (!old) return old;
        return old.filter((user) => user.id !== userId);
      });

      return { previousUsers };
    },
    onSuccess: () => {
      // Invalidate to ensure server state is reflected
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Toast is handled by action-handler
    },
    onError: (_error, _variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousUsers) {
        queryClient.setQueryData(userKeys.lists(), context.previousUsers);
      }
      // Error toast is handled by action-handler
    },
  });
}
