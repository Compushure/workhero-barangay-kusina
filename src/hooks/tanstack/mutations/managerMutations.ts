/**
 * Manager Task Mutation Hooks
 * ============================
 * TanStack Query mutation hooks for manager task operations.
 * Handles optimistic updates, cache invalidation, and error handling.
 */

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { handleApproveTask, handleRejectTask } from '@/action-handlers/manager';
import type { VerificationRequest } from '@/types';
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
  { previousTasks: VerificationRequest[] | undefined }
> {
  const queryClient = useQueryClient();
  const { optimisticApprove, updateTask } = useTaskStore();

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
      await queryClient.cancelQueries({ queryKey: managerTaskKeys.lists() });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<VerificationRequest[]>(
        managerTaskKeys.list('in review')
      );

      // Optimistic update in Zustand store
      optimisticApprove(id);

      // Optimistically update the cache
      queryClient.setQueryData<VerificationRequest[]>(managerTaskKeys.list('in review'), (old) => {
        if (!old) return old;
        return old.map((task) => (task.kpitask_id === id ? { ...task, status: 'approved' } : task));
      });

      return { previousTasks };
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(managerTaskKeys.list('in review'), context.previousTasks);
      }
    },
    onSuccess: (data, { id }) => {
      // Update Zustand store with server response
      if (data) {
        updateTask(id, data);
      }
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
  { previousTasks: VerificationRequest[] | undefined }
> {
  const queryClient = useQueryClient();
  const { optimisticReject, updateTask } = useTaskStore();

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
      await queryClient.cancelQueries({ queryKey: managerTaskKeys.lists() });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<VerificationRequest[]>(
        managerTaskKeys.list('in review')
      );

      // Optimistic update in Zustand store
      optimisticReject(id);

      // Optimistically update the cache
      queryClient.setQueryData<VerificationRequest[]>(managerTaskKeys.list('in review'), (old) => {
        if (!old) return old;
        return old.map((task) => (task.kpitask_id === id ? { ...task, status: 'rejected' } : task));
      });

      return { previousTasks };
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(managerTaskKeys.list('in review'), context.previousTasks);
      }
    },
    onSuccess: (data, { id }) => {
      // Update Zustand store with server response
      if (data) {
        updateTask(id, data);
      }
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
