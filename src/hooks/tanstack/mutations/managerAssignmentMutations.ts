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
  handleClearUnstartedTaskAssignments,
  handleClearUnstartedEmployeeTasks,
  handleUpdateTaskAssignment,
} from '@/action-handlers/manager/assigned-tasks';
import { handleAddTaskAssignment } from '@/action-handlers/manager/assignments';
import { managerAssignmentKeys } from '../queries/managerAssignmentQueries';
import { useManagerAssignmentStore } from '@/store/managerAssignmentStore';
import { toast } from 'sonner';
import type { AssignedTask } from '@/types';

export function useAddTaskAssignmentMutation(): UseMutationResult<
  AssignedTask[],
  Error,
  {
    taskId: string;
    employeeIds: string[];
    startDate: string;
    endDate: string;
    maxOrders?: number;
    optimisticTasks: AssignedTask[];
  }
> {
  const queryClient = useQueryClient();
  const { startOptimistic, optimisticMergeAssignedTasks, rollback, commit } =
    useManagerAssignmentStore();

  return useMutation({
    mutationFn: async ({ taskId, employeeIds, startDate, endDate, maxOrders }) =>
      handleAddTaskAssignment(taskId, employeeIds, startDate, endDate, maxOrders, { notify: false }),
    onMutate: ({ optimisticTasks }) => {
      startOptimistic();
      optimisticMergeAssignedTasks(optimisticTasks);
    },
    onSuccess: (assignedTasks) => {
      if (assignedTasks.length === 0) {
        rollback();
        toast.error('Failed to assign task. Rolled back changes.');
        return;
      }

      commit();
      const assignedCount = assignedTasks.reduce(
        (count, task) => count + task.assignedEmployees.length,
        0
      );
      toast.success(`Task assigned to ${assignedCount} employee${assignedCount === 1 ? '' : 's'}`);
    },
    onError: (error) => {
      rollback();
      toast.error('Failed to assign task. Rolling back changes.');
      console.error('Error assigning task:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.employees() });
    },
  });
}

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
  const { startOptimistic, optimisticDeleteAssignment, rollback, commit } =
    useManagerAssignmentStore();

  return useMutation({
    mutationFn: async ({ assignmentId }: { assignmentId: string }) => {
      return await handleDeleteTask(assignmentId);
    },
    onMutate: async ({ assignmentId }) => {
      startOptimistic();
      optimisticDeleteAssignment(assignmentId);
    },
    onSuccess: (didDelete) => {
      if (didDelete) {
        commit();
      } else {
        rollback();
      }
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.employees() });
    },
    onError: (error) => {
      rollback();
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
  const { startOptimistic, optimisticDeleteTaskGroup, rollback, commit } =
    useManagerAssignmentStore();

  return useMutation({
    mutationFn: async ({ categoryId, deadlineDate, maxOrders, createdAt }) => {
      return await handleDeleteTaskForAllEmployees(categoryId, deadlineDate, maxOrders, createdAt);
    },
    onMutate: async ({ categoryId, deadlineDate, maxOrders, createdAt }) => {
      startOptimistic();
      optimisticDeleteTaskGroup({ categoryId, deadlineDate, maxOrders, createdAt });
    },
    onSuccess: (didDelete) => {
      if (didDelete) {
        commit();
      } else {
        rollback();
      }
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.employees() });
    },
    onError: (error) => {
      rollback();
      toast.error('Failed to delete task group.');
      console.error('Error deleting task group:', error);
    },
  });
}

/**
 * Mutation for clearing unstarted (no progress) 'assigned' task assignments
 * Only removes assignments with status='assigned', completed_orders=0, pending_orders=0
 */
export function useClearUnstartedTaskAssignmentsMutation(): UseMutationResult<number, Error, void> {
  const queryClient = useQueryClient();
  const { startOptimistic, optimisticClearUnstartedAssigned, rollback, commit } =
    useManagerAssignmentStore();

  return useMutation({
    mutationFn: async () => {
      return await handleClearUnstartedTaskAssignments();
    },
    onMutate: async () => {
      startOptimistic();
      optimisticClearUnstartedAssigned();
    },
    onSuccess: () => {
      commit();
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.all });
    },
    onError: (error) => {
      rollback();
      toast.error('Failed to clear unstarted assignments. Rolling back changes.');
      console.error('Error clearing unstarted tasks:', error);
    },
  });
}

/**
 * Mutation for clearing unstarted tasks for a specific employee
 * Automatically invalidates relevant queries on success
 */
export function useClearUnstartedEmployeeTasksMutation(): UseMutationResult<
  number,
  Error,
  { employeeId: string }
> {
  const queryClient = useQueryClient();
  const { startOptimistic, optimisticClearUnstartedEmployeeTasks, rollback, commit } =
    useManagerAssignmentStore();

  return useMutation({
    mutationFn: async ({ employeeId }: { employeeId: string }) => {
      return await handleClearUnstartedEmployeeTasks(employeeId);
    },
    onMutate: async ({ employeeId }) => {
      startOptimistic();
      optimisticClearUnstartedEmployeeTasks(employeeId);
    },
    onSuccess: () => {
      commit();
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.tasks() });
      queryClient.invalidateQueries({ queryKey: managerAssignmentKeys.employees() });
    },
    onError: (error) => {
      rollback();
      toast.error('Failed to clear unstarted employee tasks. Rolling back changes.');
      console.error('Error clearing unstarted employee tasks:', error);
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
