/**
 * Task Category Mutation Hooks
 * ==============================
 * TanStack Query mutation hooks for task category operations.
 * Handles optimistic updates, cache invalidation, and error handling.
 */

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import {
  handleAddTaskCategory,
  handleEditTaskCategoryAction,
  handleDeleteTaskCategoryAction,
} from '@/action-handlers/manager-editor';
import type { TaskCategory } from '@/types/manager/task-editor';
import type { AddTaskInput, EditTaskInput } from '@/zod/schemas/task';
import { taskCategoryKeys } from '../queries/managerEditorQueries';

/**
 * Adds a new task category
 *
 * @returns Mutation object with mutate/mutateAsync functions
 *
 * @example
 * ```tsx
 * function AddTaskCategoryForm() {
 *   const addCategory = useAddTaskCategory()
 *
 *   const handleSubmit = (data: AddTaskInput) => {
 *     addCategory.mutate(data, {
 *       onSuccess: (newCategory) => {
 *         console.log('Category added:', newCategory)
 *       }
 *     })
 *   }
 *
 *   return <form onSubmit={handleSubmit}>...</form>
 * }
 * ```
 */
export function useAddTaskCategory(): UseMutationResult<
  TaskCategory | null,
  Error,
  AddTaskInput,
  { previousCategories: TaskCategory[] | undefined }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddTaskInput): Promise<TaskCategory | null> => {
      return await handleAddTaskCategory(input);
    },
    onMutate: async (newCategory) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskCategoryKeys.lists() });

      // Snapshot previous value
      const previousCategories = queryClient.getQueryData<TaskCategory[]>(taskCategoryKeys.list());

      return { previousCategories };
    },
    onError: (error, newCategory, context) => {
      // Rollback on error
      if (context?.previousCategories) {
        queryClient.setQueryData(taskCategoryKeys.list(), context.previousCategories);
      }
    },
    onSuccess: (data) => {
      // Update paginated cache with new category
      if (data) {
        queryClient.setQueryData(taskCategoryKeys.paginatedList(1, 10, 'type-name', ''), (old: any) => {
          if (!old) return { tasks: [], count: 0, totalPages: 0 };
          return {
            ...old,
            tasks: old.tasks?.map((task: any) => task.id === data.id ? data : task),
          };
        });
      }
    },
    onSettled: () => {
      // Invalidate all task category queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: taskCategoryKeys.all });
      queryClient.invalidateQueries({ queryKey: taskCategoryKeys.paginatedList(1, 10, 'type-name', '') });
      // Also invalidate types cache
      queryClient.invalidateQueries({ queryKey: [...taskCategoryKeys.all, 'types'] });
    },
  });
}

/**
 * Edits an existing task category
 *
 * @returns Mutation object with mutate/mutateAsync functions
 *
 * @example
 * ```tsx
 * function EditTaskCategoryForm({ categoryId }: { categoryId: string }) {
 *   const editCategory = useEditTaskCategory()
 *
 *   const handleSubmit = (data: EditTaskInput) => {
 *     editCategory.mutate({ id: categoryId, input: data }, {
 *       onSuccess: (updatedCategory) => {
 *         console.log('Category updated:', updatedCategory)
 *       }
 *     })
 *   }
 *
 *   return <form onSubmit={handleSubmit}>...</form>
 * }
 * ```
 */
export function useEditTaskCategory(): UseMutationResult<
  TaskCategory | null,
  Error,
  { id: string; input: EditTaskInput },
  { previousCategories: TaskCategory[] | undefined }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: EditTaskInput;
    }): Promise<TaskCategory | null> => {
      return await handleEditTaskCategoryAction(id, input);
    },
    onMutate: async ({ id, input }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskCategoryKeys.lists() });
      await queryClient.cancelQueries({ queryKey: taskCategoryKeys.paginatedList(1, 10, 'type-name', '') });

      // Snapshot previous value
      const previousCategories = queryClient.getQueryData<TaskCategory[]>(taskCategoryKeys.list());
      const previousPaginatedData = queryClient.getQueryData(taskCategoryKeys.paginatedList(1, 10, 'type-name', ''));

      // Optimistically update both list and paginated cache
      queryClient.setQueryData<TaskCategory[]>(taskCategoryKeys.list(), (old) => {
        if (!old) return old;
        return old.map((cat) =>
          cat.id === id
            ? {
                ...cat,
                name: input.name ?? cat.name,
                type: input.type ?? cat.type,
                description: input.description ?? cat.description,
                isRepeatable: input.isRepeatable ?? cat.isRepeatable,
                points: input.points ?? cat.points,
                xp: input.xp ?? cat.xp,
              }
            : cat
        );
      });

      // Also update paginated data optimistically
      if (previousPaginatedData) {
        queryClient.setQueryData(taskCategoryKeys.paginatedList(1, 10, 'type-name', ''), (old: any) => {
          if (!old) return { tasks: [], count: 0, totalPages: 0 };
          return {
            ...old,
            tasks: old.tasks?.map((task: any) =>
              task.id === id
                ? {
                    ...task,
                    name: input.name ?? task.name,
                    type: input.type ?? task.type,
                    description: input.description ?? task.description,
                    isRepeatable: input.isRepeatable ?? task.isRepeatable,
                    points: input.points ?? task.points,
                    xp: input.xp ?? task.xp,
                  }
                : task
            ),
          };
        });
      }

      return { previousCategories };
    },
    onError: (error, { id, input }, context) => {
      // Rollback on error
      if (context?.previousCategories) {
        queryClient.setQueryData(taskCategoryKeys.list(), context.previousCategories);
      }
    },
    onSuccess: (data, { id }) => {
      // Update cache with actual server response
      if (data) {
        queryClient.setQueryData<TaskCategory[]>(taskCategoryKeys.list(), (old) => {
          if (!old) return old;
          return old.map((cat) => (cat.id === id ? data : cat));
        });

        // Update paginated cache with server response
        queryClient.setQueryData(taskCategoryKeys.paginatedList(1, 10, 'type-name', ''), (old: any) => {
          if (!old) return { tasks: [], count: 0, totalPages: 0 };
          return {
            ...old,
            tasks: old.tasks?.map((task: any) =>
              task.id === id ? data : task
            ),
          };
        });
      }
    },
    onSettled: () => {
      // Invalidate all task category queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: taskCategoryKeys.all });
      queryClient.invalidateQueries({ queryKey: taskCategoryKeys.paginatedList(1, 10, 'type-name', '') });
      // Also invalidate types cache in case type changed
      queryClient.invalidateQueries({ queryKey: [...taskCategoryKeys.all, 'types'] });
    },
  });
}

/**
 * Deletes a task category
 *
 * @returns Mutation object with mutate/mutateAsync functions
 *
 * @example
 * ```tsx
 * function DeleteTaskCategoryButton({ categoryId }: { categoryId: string }) {
 *   const deleteCategory = useDeleteTaskCategory()
 *
 *   const handleDelete = () => {
 *     deleteCategory.mutate(categoryId, {
 *       onSuccess: () => {
 *         console.log('Category deleted')
 *       }
 *     })
 *   }
 *
 *   return <button onClick={handleDelete}>Delete</button>
 * }
 * ```
 */
export function useDeleteTaskCategory(): UseMutationResult<
  boolean,
  Error,
  string,
  { previousCategories: TaskCategory[] | undefined }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<boolean> => {
      return await handleDeleteTaskCategoryAction(id);
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskCategoryKeys.lists() });
      await queryClient.cancelQueries({ queryKey: taskCategoryKeys.paginatedList(1, 10, 'type-name', '') });

      // Snapshot previous value
      const previousCategories = queryClient.getQueryData<TaskCategory[]>(taskCategoryKeys.list());
      const previousPaginatedData = queryClient.getQueryData(taskCategoryKeys.paginatedList(1, 10, 'type-name', ''));

      // Optimistically remove from both caches
      queryClient.setQueryData<TaskCategory[]>(taskCategoryKeys.list(), (old) => {
        if (!old) return old;
        return old.filter((cat) => cat.id !== id);
      });

      // Also remove from paginated cache optimistically
      if (previousPaginatedData) {
        queryClient.setQueryData(taskCategoryKeys.paginatedList(1, 10, 'type-name', ''), (old: any) => {
          if (!old) return { tasks: [], count: 0, totalPages: 0 };
          return {
            ...old,
            tasks: old.tasks?.filter((task: any) => task.id !== id),
          };
        });
      }

      return { previousCategories };
    },
    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousCategories) {
        queryClient.setQueryData(taskCategoryKeys.list(), context.previousCategories);
      }
    },
    onSuccess: () => {
      // Deletion successful, cache already updated optimistically
    },
    onSettled: () => {
      // Invalidate all task category queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: taskCategoryKeys.all });
      queryClient.invalidateQueries({ queryKey: taskCategoryKeys.paginatedList(1, 10, 'type-name', '') });
      // Also invalidate types cache in case this was the last of a type
      queryClient.invalidateQueries({ queryKey: [...taskCategoryKeys.all, 'types'] });
    },
  });
}
