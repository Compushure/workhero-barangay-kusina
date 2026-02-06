/**
 * Manager Task Assignment Mutation Hooks
 * =======================================
 * TanStack Query mutation hooks for manager task assignment operations.
 * Handles optimistic updates, cache invalidation, and error handling.
 */

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import {
  handleDeleteTask,
  handleClearAllTasks,
  handleClearAllEmployeeTasks,
  handleUpdateTaskAssignment,
} from '@/action-handlers/manager/assigned-tasks';
import { managerAssignmentKeys } from '../queries/managerAssignmentQueries';

/**
 * Mutation for deleting a task assignment
 * Automatically invalidates relevant task queries on success
 */
export function useDeleteTaskMutation(): UseMutationResult<
  boolean,
  Error,
  { taskId: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId }: { taskId: string }) => {
      return await handleDeleteTask(taskId);
    },
    onSuccess: () => {
      // Invalidate both task and employee views
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.tasks() });
      queryClient.invalidateQueries({
        queryKey: managerAssignmentKeys.employees(),
      });
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
    },
  });
}

/**
 * Mutation for clearing all task assignments
 * Automatically invalidates all assignment queries on success
 */
export function useClearAllTasksMutation(): UseMutationResult<
  boolean,
  Error,
  void
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await handleClearAllTasks();
    },
    onSuccess: () => {
      // Invalidate all assignment data
      queryClient.invalidateQueries({
        queryKey: managerAssignmentKeys.all,
      });
    },
    onError: (error) => {
      console.error('Error clearing all tasks:', error);
    },
  });
}

/**
 * Mutation for clearing all tasks for a specific employee
 * Automatically invalidates relevant queries on success
 */
export function useClearAllEmployeeTasksMutation(): UseMutationResult<
  boolean,
  Error,
  { employeeId: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employeeId }: { employeeId: string }) => {
      return await handleClearAllEmployeeTasks(employeeId);
    },
    onSuccess: () => {
      // Invalidate both task and employee views
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.tasks() });
      queryClient.invalidateQueries({
        queryKey: managerAssignmentKeys.employees(),
      });
    },
    onError: (error) => {
      console.error('Error clearing employee tasks:', error);
    },
  });
}

/**
 * Mutation for updating a task assignment
 * Automatically invalidates affected queries on success
 */
export function useUpdateTaskAssignmentMutation(): UseMutationResult<
  boolean,
  Error,
  { taskId: string; maxOrders: number; newDueDate: string; employeeIds: string[] }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      maxOrders,
      newDueDate,
      employeeIds,
    }: {
      taskId: string;
      maxOrders: number;
      newDueDate: string;
      employeeIds: string[];
    }) => {
      return await handleUpdateTaskAssignment(
        taskId,
        maxOrders,
        newDueDate,
        employeeIds
      );
    },
    onSuccess: () => {
      // Invalidate both task and employee views
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.tasks() });
      queryClient.invalidateQueries({
        queryKey: managerAssignmentKeys.employees(),
      });
    },
    onError: (error) => {
      console.error('Error updating task assignment:', error);
    },
  });
}
