/**
 * Manager Task Assignment Action Handlers (Client-side)
 * =====================================================
 * Client-side wrappers for manager task assignment server actions.
 * Handles UI feedback (toasts) and state management integration.
 * Uses safeAction wrapper for consistent error handling.
 */

import { safeAction } from '@/lib/utils/safe-action';
import {
  fetchTaskList,
  fetchEmployeeList,
  addTaskAssignmentAction,
} from '@/actions/manager-assignment';
import type { Task, AssignedEmployee } from '@/types';
import { toast } from 'sonner';

/**
 * Fetches all available tasks for assignment with error handling and toast feedback
 * @returns Array of tasks or empty array on error
 */
export async function handleFetchTaskList(): Promise<Task[]> {
  const result = await safeAction(() => fetchTaskList());

  if (!result.success) {
    toast.error('Failed to load tasks: ' + result.error);
    return [];
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return [];
  }

  return result.data?.data ?? [];
}

/**
 * Fetches all active employees for task assignment with error handling and toast feedback
 * @returns Array of employees or empty array on error
 */
export async function handleFetchEmployeeList(): Promise<AssignedEmployee[]> {
  const result = await safeAction(() => fetchEmployeeList());

  if (!result.success) {
    toast.error('Failed to load employees: ' + result.error);
    return [];
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return [];
  }

  return result.data?.data ?? [];
}

/**
 * Assigns a task to one or more employees with error handling and toast feedback
 * @param taskId - ID of the task to assign
 * @param employeeIds - Array of employee IDs to assign the task to
 * @param startDate - Start date for the task assignment
 * @param endDate - End date for the task assignment
 * @param maxAttempts - Optional maximum number of attempts for the task
 * @returns boolean indicating success or failure
 */
export async function handleAddTaskAssignment(
  taskId: string,
  employeeIds: string[],
  startDate: string,
  endDate: string,
  maxAttempts?: number
): Promise<boolean> {
  const result = await safeAction(() =>
    addTaskAssignmentAction(taskId, employeeIds, startDate, endDate, maxAttempts)
  );

  if (!result.success) {
    toast.error('Failed to assign task: ' + result.error);
    return false;
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return false;
  }

  toast.success('Task assigned successfully');
  return true;
}
