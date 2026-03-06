/**
 * Manager Task Assignment Mutation Hooks
 * =======================================
 * TanStack Query mutation hooks for manager task assignment operations.
 * Handles optimistic updates, cache invalidation, and error handling.
 */

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import {
  handleDeleteTask,
  handleDeleteTaskForAllEmployees,
  handleClearAssignedTasks,
  handleClearAllEmployeeTasks,
  handleUpdateTaskAssignment,
} from '@/action-handlers/manager/assigned-tasks';
import { managerAssignmentKeys } from '../queries/managerAssignmentQueries';
import { useManagerAssignmentStore } from '@/store/managerAssignmentStore';
import { toast } from 'sonner';

/**
 * Mutation for deleting a task assignment
 * Automatically invalidates relevant task queries on success
 */
export function useDeleteTaskMutation(): UseMutationResult<
  boolean,
  Error,
  { assignmentId: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assignmentId }: { assignmentId: string }) => {
      return await handleDeleteTask(assignmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.employees() });
    },
    onError: (error) => {
      toast.error('Failed to delete task assignment.');
      console.error('Error deleting task:', error);
    },
  });
}

/**
 * Mutation for deleting all assignments for a task group
 * This removes the task card and unassigns all employees in that group
 */
export function useDeleteTaskGroupMutation(): UseMutationResult<
  boolean,
  Error,
  { categoryId: string; deadlineDate: string; maxOrders: number; createdAt: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, deadlineDate, maxOrders, createdAt }) => {
      return await handleDeleteTaskForAllEmployees(categoryId, deadlineDate, maxOrders, createdAt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.employees() });
    },
    onError: (error) => {
      toast.error('Failed to delete task group.');
      console.error('Error deleting task group:', error);
    },
  });
}

/**
 * Mutation for clearing all 'assigned' task assignments
 * Automatically invalidates all assignment queries on success
 */
export function useClearAssignedTasksMutation(): UseMutationResult<boolean, Error, void> {
  const queryClient = useQueryClient();
  const { startOptimistic, optimisticClearAll, rollback, commit } = useManagerAssignmentStore();

  return useMutation({
    mutationFn: async () => {
      return await handleClearAssignedTasks();
    },
    onMutate: async () => {
      startOptimistic();
      optimisticClearAll();
    },
    onSuccess: () => {
      commit();
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.all });
    },
    onError: (error) => {
      rollback();
      toast.error('Failed to clear assigned tasks. Rolling back changes.');
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
  const { startOptimistic, optimisticClearAllEmployeeTasks, rollback, commit } =
    useManagerAssignmentStore();

  return useMutation({
    mutationFn: async ({ employeeId }: { employeeId: string }) => {
      return await handleClearAllEmployeeTasks(employeeId);
    },
    onMutate: async ({ employeeId }) => {
      startOptimistic();
      optimisticClearAllEmployeeTasks(employeeId);
    },
    onSuccess: () => {
      commit();
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.employees() });
    },
    onError: (error) => {
      rollback();
      toast.error('Failed to clear employee tasks. Rolling back changes.');
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
  const { startOptimistic, optimisticUpdateTask, rollback, commit } = useManagerAssignmentStore();

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
      return await handleUpdateTaskAssignment(taskId, maxOrders, newDueDate, employeeIds);
    },
    onMutate: async ({ taskId, maxOrders, newDueDate, employeeIds }) => {
      startOptimistic();
      optimisticUpdateTask(taskId, { maxOrders, newDueDate, employeeIds });
    },
    onSuccess: () => {
      commit();
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.employees() });
    },
    onError: (error) => {
      rollback();
      toast.error('Failed to update task assignment. Rolling back changes.');
      console.error('Error updating task assignment:', error);
    },
  });
}
