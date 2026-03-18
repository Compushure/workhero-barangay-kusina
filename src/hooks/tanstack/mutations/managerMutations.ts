/**
 * Manager Task Mutation Hooks
 * ============================
 * TanStack Query mutation hooks for manager task operations.
 * Handles optimistic updates, cache invalidation, and error handling.
 */

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import { handleApproveTask, handleRejectTask } from '@/action-handlers/manager/verification';
import type { VerificationRequest, PaginatedResponse } from '@/types';
import { managerTaskKeys } from '../queries/managerQueries';
import { useTaskStore } from '@/store/taskStore';

/**
 * Approves a task with optimistic updates
 *
 * @returns Mutation object with mutate/mutateAsync functions
 *
 * @example
 * ```tsx
 * function TaskApprovalButton({ taskId }: { taskId: string }) {
 *   const approveTask = useApproveTask()
 *
 *   const handleApprove = () => {
 *     approveTask.mutate({ id: taskId, remark: 'Good job!' }, {
 *       onSuccess: () => {
 *         console.log('Task approved')
 *       }
 *     })
 *   }
 *
 *   return <button onClick={handleApprove}>Approve</button>
 * }
 * ```
 */
export function useApproveTask(): UseMutationResult<
  VerificationRequest | null,
  Error,
  { id: string; remark: string },
  {
    previousTasks: VerificationRequest[] | undefined;
    previousPendingPaginated: Array<[QueryKey, PaginatedResponse<VerificationRequest> | undefined]>;
  }
> {
  const queryClient = useQueryClient();
  const { optimisticApprove, startOptimistic, commit, rollback } = useTaskStore();

  return useMutation({
    mutationFn: async ({
      id,
      remark,
    }: {
      id: string;
      remark: string;
    }): Promise<VerificationRequest | null> => {
      return await handleApproveTask(id, remark);
    },
    onMutate: async ({ id }: { id: string; remark: string }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: managerTaskKeys.paginatedLists() });
      await queryClient.cancelQueries({ queryKey: managerTaskKeys.lists() });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<VerificationRequest[]>(
        managerTaskKeys.list('in review')
      );
      const previousPendingPaginated = queryClient
        .getQueriesData<PaginatedResponse<VerificationRequest>>({
          queryKey: managerTaskKeys.paginatedLists(),
        })
        .filter(([queryKey]) => queryKey[2] === 'in-review');

      // Optimistic update in Zustand store
      startOptimistic();
      optimisticApprove(id);

      // Optimistically update legacy non-paginated cache
      queryClient.setQueryData<VerificationRequest[]>(managerTaskKeys.list('in review'), (old) => {
        if (!old) return old;
        return old.filter((task) => task.kpitask_id !== id);
      });

      // Optimistically remove the task from every pending paginated page
      previousPendingPaginated.forEach(([queryKey]) => {
        queryClient.setQueryData<PaginatedResponse<VerificationRequest>>(queryKey, (old) => {
          if (!old) return old;
          const nextData = old.data.filter((task) => task.kpitask_id !== id);
          const removedCount = old.data.length - nextData.length;
          if (removedCount === 0) return old;

          return {
            ...old,
            data: nextData,
            count: Math.max(0, old.count - removedCount),
          };
        });
      });

      return { previousTasks, previousPendingPaginated };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(managerTaskKeys.list('in review'), context.previousTasks);
      }

      context?.previousPendingPaginated.forEach(([queryKey, previousData]) => {
        queryClient.setQueryData(queryKey, previousData);
      });

      rollback();
    },
    onSuccess: () => {
      commit();
    },
    onSettled: () => {
      // Invalidate all paginated queries to refetch updated data
      // This ensures tasks are refetched from all categories after approve/reject
      queryClient.invalidateQueries({ queryKey: managerTaskKeys.paginatedLists() });
      // Also invalidate non-paginated for backward compatibility
      queryClient.invalidateQueries({ queryKey: managerTaskKeys.lists() });
    },
  });
}

/**
 * Rejects a task with optimistic updates
 *
 * @returns Mutation object with mutate/mutateAsync functions
 *
 * @example
 * ```tsx
 * function TaskRejectionButton({ taskId }: { taskId: string }) {
 *   const rejectTask = useRejectTask()
 *
 *   const handleReject = () => {
 *     rejectTask.mutate({ id: taskId, remark: 'Incomplete' }, {
 *       onSuccess: () => {
 *         console.log('Task rejected')
 *       }
 *     })
 *   }
 *
 *   return <button onClick={handleReject}>Reject</button>
 * }
 * ```
 */
export function useRejectTask(): UseMutationResult<
  VerificationRequest | null,
  Error,
  { id: string; remark: string },
  {
    previousTasks: VerificationRequest[] | undefined;
    previousPendingPaginated: Array<[QueryKey, PaginatedResponse<VerificationRequest> | undefined]>;
  }
> {
  const queryClient = useQueryClient();
  const { optimisticReject, startOptimistic, commit, rollback } = useTaskStore();

  return useMutation({
    mutationFn: async ({
      id,
      remark,
    }: {
      id: string;
      remark: string;
    }): Promise<VerificationRequest | null> => {
      return await handleRejectTask(id, remark);
    },
    onMutate: async ({ id }: { id: string; remark: string }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: managerTaskKeys.paginatedLists() });
      await queryClient.cancelQueries({ queryKey: managerTaskKeys.lists() });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<VerificationRequest[]>(
        managerTaskKeys.list('in review')
      );
      const previousPendingPaginated = queryClient
        .getQueriesData<PaginatedResponse<VerificationRequest>>({
          queryKey: managerTaskKeys.paginatedLists(),
        })
        .filter(([queryKey]) => queryKey[2] === 'in-review');

      // Optimistic update in Zustand store
      startOptimistic();
      optimisticReject(id);

      // Optimistically update legacy non-paginated cache
      queryClient.setQueryData<VerificationRequest[]>(managerTaskKeys.list('in review'), (old) => {
        if (!old) return old;
        return old.filter((task) => task.kpitask_id !== id);
      });

      // Optimistically remove the task from every pending paginated page
      previousPendingPaginated.forEach(([queryKey]) => {
        queryClient.setQueryData<PaginatedResponse<VerificationRequest>>(queryKey, (old) => {
          if (!old) return old;
          const nextData = old.data.filter((task) => task.kpitask_id !== id);
          const removedCount = old.data.length - nextData.length;
          if (removedCount === 0) return old;

          return {
            ...old,
            data: nextData,
            count: Math.max(0, old.count - removedCount),
          };
        });
      });

      return { previousTasks, previousPendingPaginated };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(managerTaskKeys.list('in review'), context.previousTasks);
      }

      context?.previousPendingPaginated.forEach(([queryKey, previousData]) => {
        queryClient.setQueryData(queryKey, previousData);
      });

      rollback();
    },
    onSuccess: () => {
      commit();
    },
    onSettled: () => {
      // Invalidate all paginated queries to refetch updated data
      // This ensures tasks are refetched from all categories after approve/reject
      queryClient.invalidateQueries({ queryKey: managerTaskKeys.paginatedLists() });
      // Also invalidate non-paginated for backward compatibility
      queryClient.invalidateQueries({ queryKey: managerTaskKeys.lists() });
    },
  });
}
