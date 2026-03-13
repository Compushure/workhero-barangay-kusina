/**
 * Employee Tasks TanStack Mutations
 * =================================
 * React Query mutation hooks for employee task operations.
 * Provides optimistic updates, error handling, and cache invalidation.
 */

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import {
  handleSubmitTaskVerification,
  handleClaimTaskPointsAndXP,
  handleRedoTask,
} from '@/action-handlers/employee/tasks';
import type { SubmitVerificationResult, ClaimTaskResult } from '@/actions/employee/tasks';
import { employeeTasksKeys } from '../queries/employeeTasksQueries';
import { employeeKeys } from '../queries/employeeQueries';

/**
 * Mutation for submitting a task for manager verification
 * Automatically invalidates tasks cache on success to refresh the UI
 */
export function useSubmitTaskVerification(): UseMutationResult<
  SubmitVerificationResult | null,
  Error,
  { kpitaskId: string; pendingOrders: number }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ kpitaskId, pendingOrders }) => {
      return await handleSubmitTaskVerification(kpitaskId, pendingOrders);
    },
    onSuccess: () => {
      // Invalidate tasks cache to reflect the status change
      queryClient.invalidateQueries({ queryKey: employeeTasksKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to submit task verification:', error);
    },
  });
}

/**
 * Mutation for redoing a rejected task
 * Moves the task back to 'assigned' status so it can be resubmitted
 * Automatically invalidates tasks cache on success to reflect the status change
 */
export function useRedoTask(): UseMutationResult<boolean | null, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kpitaskId: string) => {
      return await handleRedoTask(kpitaskId);
    },
    onSuccess: () => {
      // Invalidate tasks cache to reflect the status change
      queryClient.invalidateQueries({ queryKey: employeeTasksKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to redo task:', error);
    },
  });
}

/**
 * Mutation for claiming task points and XP
 * Automatically invalidates tasks cache on success to reflect the claimed status
 * Includes optimistic updates for immediate UI feedback on points and XP
 */
export function useClaimTaskPointsandXP(): UseMutationResult<
  ClaimTaskResult | null,
  Error,
  {
    kpitaskId: string;
    taskName: string;
    pendingOrders: number;
    completedOrders: number;
    maxOrders: number;
  }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ kpitaskId, taskName, pendingOrders, completedOrders, maxOrders }) => {
      return await handleClaimTaskPointsAndXP(
        kpitaskId,
        taskName,
        pendingOrders,
        completedOrders,
        maxOrders
      );
    },
    onMutate: async ({}) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: employeeKeys.points() });
      await queryClient.cancelQueries({ queryKey: employeeKeys.xp() });

      // Snapshot the previous value
      const previousPoints = queryClient.getQueryData(employeeKeys.points());
      const previousXP = queryClient.getQueryData(employeeKeys.xp());

      // Return a context object with the snapshotted value
      return { previousPoints, previousXP };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPoints) {
        queryClient.setQueryData(employeeKeys.points(), context.previousPoints);
      }
      if (context?.previousXP) {
        queryClient.setQueryData(employeeKeys.xp(), context.previousXP);
      }
      console.error('Failed to claim task points:', err);
    },
    onSuccess: (data, variables) => {
      // Optimistically update the points cache with the new data
      if (data) {
        queryClient.setQueryData(employeeKeys.points(), (old: any) => {
          if (!old) return old;
          return {
            ...old,
            points: old.points + data.pointsAdded,
          };
        });

        // Optimistically update the XP cache
        queryClient.setQueryData(employeeKeys.xp(), (old: any) => {
          if (!old) return old;
          const newTotalXP = old.totalXP + data.xpAdded;
          const newLevel = Math.floor(newTotalXP / 100);
          const newCurrentXP = newTotalXP % 100;

          return {
            ...old,
            totalXP: newTotalXP,
            level: newLevel,
            currentXP: newCurrentXP,
          };
        });
      }

      // Remove claimed task from approved list in the shared cache after success
      queryClient.setQueryData(employeeTasksKeys.list(), (old: any) => {
        if (!old || !old.verifiedTasks) return old;
        return {
          ...old,
          verifiedTasks: old.verifiedTasks.filter(
            (task: { id: string }) => task.id !== variables.kpitaskId
          ),
        };
      });
    },
    onSettled: () => {
      // Always refetch after error or success to make sure the server state is reflected
      queryClient.invalidateQueries({ queryKey: employeeKeys.points() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.xp() });
      // Invalidate tasks cache to reflect the claimed status
      queryClient.invalidateQueries({ queryKey: employeeTasksKeys.lists() });
    },
  });
}
