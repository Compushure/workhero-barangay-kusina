/**
 * Manager Task Mutation Hooks
 * ============================
 * TanStack Query mutation hooks for manager task operations.
 * Handles optimistic updates, cache invalidation, and error handling.
 */

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { handleApproveTask, handleRejectTask } from '@/action-handlers/manager';
import type { VerificationRequest } from '@/types/manager-verification-req';
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
 *     approveTask.mutate(taskId, {
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
  string,
  { previousTasks: VerificationRequest[] | undefined }
> {
  const queryClient = useQueryClient();
  const { optimisticApprove, updateTask } = useTaskStore();

  return useMutation({
    mutationFn: async (taskId: string): Promise<VerificationRequest | null> => {
      return await handleApproveTask(taskId);
    },
    onMutate: async (taskId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: managerTaskKeys.lists() });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<VerificationRequest[]>(
        managerTaskKeys.list('in review')
      );

      // Optimistic update in Zustand store
      optimisticApprove(taskId);

      // Optimistically update the cache
      queryClient.setQueryData<VerificationRequest[]>(managerTaskKeys.list('in review'), (old) => {
        if (!old) return old;
        return old.map((task) =>
          task.kpitask_id === taskId ? { ...task, status: 'approved' } : task
        );
      });

      return { previousTasks };
    },
    onError: (error, taskId, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(managerTaskKeys.list('in review'), context.previousTasks);
      }
    },
    onSuccess: (data, taskId) => {
      // Update Zustand store with server response
      if (data) {
        updateTask(taskId, data);
      }
    },
    onSettled: () => {
      // Always refetch after mutation (success or error)
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
 *     rejectTask.mutate(taskId, {
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
  string,
  { previousTasks: VerificationRequest[] | undefined }
> {
  const queryClient = useQueryClient();
  const { optimisticReject, updateTask } = useTaskStore();

  return useMutation({
    mutationFn: async (taskId: string): Promise<VerificationRequest | null> => {
      return await handleRejectTask(taskId);
    },
    onMutate: async (taskId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: managerTaskKeys.lists() });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<VerificationRequest[]>(
        managerTaskKeys.list('in review')
      );

      // Optimistic update in Zustand store
      optimisticReject(taskId);

      // Optimistically update the cache
      queryClient.setQueryData<VerificationRequest[]>(managerTaskKeys.list('in review'), (old) => {
        if (!old) return old;
        return old.map((task) =>
          task.kpitask_id === taskId ? { ...task, status: 'rejected' } : task
        );
      });

      return { previousTasks };
    },
    onError: (error, taskId, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(managerTaskKeys.list('in review'), context.previousTasks);
      }
    },
    onSuccess: (data, taskId) => {
      // Update Zustand store with server response
      if (data) {
        updateTask(taskId, data);
      }
    },
    onSettled: () => {
      // Always refetch after mutation (success or error)
      queryClient.invalidateQueries({ queryKey: managerTaskKeys.lists() });
    },
  });
}
