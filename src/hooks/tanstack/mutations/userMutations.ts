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
} from '@/action-handlers/manage';
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
export function useUploadProfilePicture() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { file: File; userid: string; username: string }>({
    mutationFn: async ({ file, userid, username }): Promise<void> => {
      // Use action-handler which includes safeAction wrapper and toast handling
      await handleUploadProfilePicture(username, userid, file);
    },
    onSuccess: () => {
      // Invalidate ALL user queries (including filtered ones) by using the base key
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      // Toast is handled by action-handler
    },
    onError: (_error) => {
      // Rollback optimistic update on error
      // Error toast is handled by action-handler
    },
  });
}

export function useAddUser(): UseMutationResult<User, Error, AddUserInput, { previousQueries: Map<string, unknown> }> {
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
    onMutate: async (input: AddUserInput) => {
      // Cancel any outgoing refetches to prevent overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: userKeys.all });

      // Store previous queries for rollback
      const previousQueries = new Map<string, unknown>();
      
      // Create temporary user object with expected structure
      const tempUser: User = {
        id: `temp-${Date.now()}`, // Temporary ID
        name: input.name,
        email: input.email,
        employeeType: input.employeeType,
        employmentStatus: input.employmentStatus || '',
        date_added: new Date(),
        createdAt: new Date(),
        employeeId: input.employeeId || '',
        contactNumber: input.contactNumber || '',
        address: input.address,
        tin: input.tin || '',
        sss: input.sss || '',
        pagibig: input.pagibig || '',
        companyId: input.companyId || '',
      };

      // Update ALL cached user queries optimistically
      const queryCache = queryClient.getQueryCache();
      const userQueries = queryCache.findAll({ queryKey: userKeys.all });

      userQueries.forEach((query) => {
        const key = JSON.stringify(query.queryKey);
        const oldData = query.state.data;
        previousQueries.set(key, oldData);

        // Check if this is a paginated query
        if (query.queryKey.includes('paginated')) {
          type PaginatedUsers = { data: User[]; count?: number };
          const paginatedData = oldData as PaginatedUsers | undefined;
          if (paginatedData?.data) {
            // Add to beginning of paginated results
            queryClient.setQueryData(query.queryKey, {
              ...paginatedData,
              data: [tempUser, ...paginatedData.data],
              count: (paginatedData.count || 0) + 1,
            });
          }
        } else if (Array.isArray(oldData)) {
          // Regular list query
          queryClient.setQueryData(query.queryKey, [tempUser, ...oldData]);
        }
      });

      return { previousQueries };
    },
    onSuccess: () => {
      // Invalidate ALL user queries to fetch real data from server
      // This replaces the temporary optimistic data with actual server data
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      // Toast is handled by action-handler
    },
    onError: (_error, _variables, context) => {
      // Rollback all optimistic updates on error
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, key) => {
          const queryKey = JSON.parse(key);
          queryClient.setQueryData(queryKey, data);
        });
      }
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
      await queryClient.cancelQueries({ queryKey: userKeys.all });

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
      // Invalidate ALL user queries to ensure server state is reflected
      queryClient.invalidateQueries({ queryKey: userKeys.all });
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
      await queryClient.cancelQueries({ queryKey: userKeys.all });

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
      // Invalidate ALL user queries to ensure server state is reflected
      queryClient.invalidateQueries({ queryKey: userKeys.all });
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
