/**
 * Employee Tasks TanStack Mutations
 * =================================
 * React Query mutation hooks for employee task operations.
 * Keeps the task board responsive by pairing cache updates with the local task store.
 */

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import {
  handleSubmitTaskVerification,
  handleClaimTaskPointsAndXP,
  handleServeCookedTaskDish,
  handleRedoTask,
  handlePerformMoreOrders,
} from '@/action-handlers/employee/tasks';
import type { SubmitVerificationResult, ClaimTaskResult } from '@/actions/employee/tasks';
import { useEmployeeTasksStore } from '@/store/employee';
import {
  applyOptimisticTaskClaim,
  applyOptimisticPerformMoreOrders,
  applyOptimisticTaskRedo,
  applyOptimisticTaskVerification,
  toEmployeeTaskBoardData,
  toEmployeeTasksQueryData,
  type EmployeeTasksQueryShape,
} from '@/components/employee/task-status/task-status-data';
import { employeeTasksKeys } from '../queries/employeeTasksQueries';
import { employeeKeys } from '../queries/employeeQueries';
import type { EmployeePointsData } from '@/types/employee/points';
import type { EmployeeXP } from '@/types/employee/xp';

interface EmployeeTasksCacheContext {
  previousTasks: EmployeeTasksQueryShape | null | undefined;
}

interface EmployeeTaskClaimContext extends EmployeeTasksCacheContext {
  previousPoints: EmployeePointsData | null | undefined;
  previousXP: EmployeeXP | null | undefined;
}

/**
 * Mutation for submitting a task for manager verification.
 * The task moves to the review column immediately, then refetches for confirmation.
 */
export function useSubmitTaskVerification(): UseMutationResult<
  SubmitVerificationResult,
  Error,
  { kpitaskId: string; pendingOrders: number },
  EmployeeTasksCacheContext
> {
  const queryClient = useQueryClient();
  const {
    startOptimistic,
    optimisticSubmitTaskVerification,
    rollback,
    commit,
  } = useEmployeeTasksStore();

  return useMutation({
    mutationFn: async ({ kpitaskId, pendingOrders }) => {
      const result = await handleSubmitTaskVerification(kpitaskId, pendingOrders);

      if (!result) {
        throw new Error('Failed to submit task for verification');
      }

      return result;
    },
    onMutate: async ({ kpitaskId, pendingOrders }) => {
      await queryClient.cancelQueries({ queryKey: employeeTasksKeys.lists() });

      const previousTasks = queryClient.getQueryData<EmployeeTasksQueryShape | null>(
        employeeTasksKeys.list()
      );

      startOptimistic();
      optimisticSubmitTaskVerification(kpitaskId, pendingOrders);

      queryClient.setQueryData<EmployeeTasksQueryShape | null>(employeeTasksKeys.list(), (old) => {
        if (!old) return old;

        return toEmployeeTasksQueryData(
          applyOptimisticTaskVerification(toEmployeeTaskBoardData(old), {
            taskId: kpitaskId,
            pendingOrders,
          })
        );
      });

      return { previousTasks };
    },
    onError: (error, _variables, context) => {
      if (typeof context?.previousTasks !== 'undefined') {
        queryClient.setQueryData(employeeTasksKeys.list(), context.previousTasks);
      }

      rollback();
      console.error('Failed to submit task verification:', error);
    },
    onSuccess: () => {
      commit();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: employeeTasksKeys.lists() });
    },
  });
}

/**
 * Mutation for redoing a rejected task.
 * The task returns to the current queue right away to reduce waiting on mobile.
 */
export function useRedoTask(): UseMutationResult<
  boolean,
  Error,
  string,
  EmployeeTasksCacheContext
> {
  const queryClient = useQueryClient();
  const { startOptimistic, optimisticRedoTask, rollback, commit } = useEmployeeTasksStore();

  return useMutation({
    mutationFn: async (kpitaskId: string) => {
      const result = await handleRedoTask(kpitaskId);

      if (!result) {
        throw new Error('Failed to redo task');
      }

      return result;
    },
    onMutate: async (kpitaskId) => {
      await queryClient.cancelQueries({ queryKey: employeeTasksKeys.lists() });

      const previousTasks = queryClient.getQueryData<EmployeeTasksQueryShape | null>(
        employeeTasksKeys.list()
      );

      startOptimistic();
      optimisticRedoTask(kpitaskId);

      queryClient.setQueryData<EmployeeTasksQueryShape | null>(employeeTasksKeys.list(), (old) => {
        if (!old) return old;

        return toEmployeeTasksQueryData(
          applyOptimisticTaskRedo(toEmployeeTaskBoardData(old), kpitaskId)
        );
      });

      return { previousTasks };
    },
    onError: (error, _variables, context) => {
      if (typeof context?.previousTasks !== 'undefined') {
        queryClient.setQueryData(employeeTasksKeys.list(), context.previousTasks);
      }

      rollback();
      console.error('Failed to redo task:', error);
    },
    onSuccess: () => {
      commit();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: employeeTasksKeys.lists() });
    },
  });
}

/**
 * Mutation for continuing approved tasks that still have remaining orders.
 * Moves the task back to the current queue while keeping rewards already claimed.
 */
export function usePerformMoreOrders(): UseMutationResult<
  boolean,
  Error,
  string,
  EmployeeTasksCacheContext
> {
  const queryClient = useQueryClient();
  const { startOptimistic, optimisticPerformMoreOrders, rollback, commit } =
    useEmployeeTasksStore();

  return useMutation({
    mutationFn: async (kpitaskId: string) => {
      const result = await handlePerformMoreOrders(kpitaskId);

      if (!result) {
        throw new Error('Failed to continue task orders');
      }

      return result;
    },
    onMutate: async (kpitaskId) => {
      await queryClient.cancelQueries({ queryKey: employeeTasksKeys.lists() });

      const previousTasks = queryClient.getQueryData<EmployeeTasksQueryShape | null>(
        employeeTasksKeys.list()
      );

      startOptimistic();
      optimisticPerformMoreOrders(kpitaskId);

      queryClient.setQueryData<EmployeeTasksQueryShape | null>(employeeTasksKeys.list(), (old) => {
        if (!old) return old;

        return toEmployeeTasksQueryData(
          applyOptimisticPerformMoreOrders(toEmployeeTaskBoardData(old), kpitaskId)
        );
      });

      return { previousTasks };
    },
    onError: (error, _variables, context) => {
      if (typeof context?.previousTasks !== 'undefined') {
        queryClient.setQueryData(employeeTasksKeys.list(), context.previousTasks);
      }

      rollback();
      console.error('Failed to continue task orders:', error);
    },
    onSuccess: () => {
      commit();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: employeeTasksKeys.lists() });
    },
  });
}

/**
 * Mutation for claiming task points and XP.
 * The reward cache still refetches, but the task columns update instantly.
 */
export function useClaimTaskPointsandXP(): UseMutationResult<
  ClaimTaskResult,
  Error,
  {
    kpitaskId: string;
    taskName: string;
    pendingOrders: number;
    completedOrders: number;
    maxOrders: number;
  },
  EmployeeTaskClaimContext
> {
  const queryClient = useQueryClient();
  const {
    startOptimistic,
    optimisticClaimTaskRewards,
    rollback,
    commit,
  } = useEmployeeTasksStore();

  return useMutation({
    mutationFn: async ({ kpitaskId, taskName, pendingOrders, completedOrders, maxOrders }) => {
      const result = await handleClaimTaskPointsAndXP(
        kpitaskId,
        taskName,
        pendingOrders,
        completedOrders,
        maxOrders
      );

      if (!result) {
        throw new Error('Failed to claim task rewards');
      }

      return result;
    },
    onMutate: async ({ kpitaskId }) => {
      await queryClient.cancelQueries({ queryKey: employeeTasksKeys.lists() });
      await queryClient.cancelQueries({ queryKey: employeeKeys.points() });
      await queryClient.cancelQueries({ queryKey: employeeKeys.xp() });

      const previousTasks = queryClient.getQueryData<EmployeeTasksQueryShape | null>(
        employeeTasksKeys.list()
      );
      const previousPoints = queryClient.getQueryData<EmployeePointsData | null>(
        employeeKeys.points()
      );
      const previousXP = queryClient.getQueryData<EmployeeXP | null>(employeeKeys.xp());

      startOptimistic();
      optimisticClaimTaskRewards(kpitaskId);

      queryClient.setQueryData<EmployeeTasksQueryShape | null>(employeeTasksKeys.list(), (old) => {
        if (!old) return old;

        return toEmployeeTasksQueryData(
          applyOptimisticTaskClaim(toEmployeeTaskBoardData(old), kpitaskId)
        );
      });

      return { previousTasks, previousPoints, previousXP };
    },
    onError: (error, _variables, context) => {
      if (typeof context?.previousTasks !== 'undefined') {
        queryClient.setQueryData(employeeTasksKeys.list(), context.previousTasks);
      }
      if (typeof context?.previousPoints !== 'undefined') {
        queryClient.setQueryData(employeeKeys.points(), context.previousPoints);
      }
      if (typeof context?.previousXP !== 'undefined') {
        queryClient.setQueryData(employeeKeys.xp(), context.previousXP);
      }

      rollback();
      console.error('Failed to claim task rewards:', error);
    },
    onSuccess: (data) => {
      commit();

      queryClient.setQueryData<EmployeePointsData | null>(employeeKeys.points(), (old) => {
        if (!old) return old;

        return {
          ...old,
          points: old.points + data.pointsAdded,
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.points() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.xp() });
      queryClient.invalidateQueries({ queryKey: employeeTasksKeys.lists() });
    },
  });
}

/**
 * Mutation for marking a claimed completed task as served
 * Invalidates employee tasks cache so quick-task eligibility reflects server state
 */
export function useServeCookedTaskDish(): UseMutationResult<boolean | null, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kpitaskId: string) => {
      return await handleServeCookedTaskDish(kpitaskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeTasksKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to mark cooked task as served:', error);
    },
  });
}
