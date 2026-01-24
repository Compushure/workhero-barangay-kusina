/**
 * Task & Employee Action Handlers (Client-side)
 * ============================================
 * Wrappers for server actions related to task/employee management.
 * Handles UI feedback (toasts) and integrates with state management.
 * Uses safeAction wrapper for consistent error handling.
 */

import { safeAction } from '@/lib/utils/safe-action';
import {
  toggleViewAction,
  clearAllTasksAction,
  removeEmployeeFromTaskAction,
  deleteTaskAction,
  editTaskAction,
  saveTaskEditAction,
  removeTaskFromEmployeeAction,
  clearEmployeeTasksAction,
  fetchTasksPaginated,
  fetchEmployeesPaginated,
} from '@/actions/manager-current-assigned-task'; // <-- adjust import path to your backend actions
import type { Task, Employee, PaginatedResponse } from '@/types';
import { toast } from 'sonner';

/**
 * Toggles between Task View and Employee View
 */
export async function handleToggleView(): Promise<'task' | 'employee' | null> {
  const result = await safeAction(() => toggleViewAction());

  if (!result.success) {
    toast.error('Failed to toggle view: ' + result.error);
    return null;
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return null;
  }

  return result.data?.data ?? null;
}

/**
 * Clears all tasks and employees
 */
export async function handleClearAllTasks(): Promise<boolean> {
  const result = await safeAction(() => clearAllTasksAction());

  if (!result.success) {
    toast.error('Failed to clear tasks: ' + result.error);
    return false;
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return false;
  }

  toast.success('All tasks cleared successfully');
  return true;
}

/**
 * Removes a single employee from a specific task
 */
export async function handleRemoveEmployeeFromTask(
  taskId: string,
  employeeId: string
): Promise<Task | null> {
  const result = await safeAction(() =>
    removeEmployeeFromTaskAction(taskId, employeeId)
  );

  if (!result.success) {
    toast.error('Failed to remove employee: ' + result.error);
    return null;
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return null;
  }

  toast.success('Employee removed from task');
  return result.data?.data ?? null;
}

/**
 * Deletes a task card
 */
export async function handleDeleteTask(taskId: string): Promise<boolean> {
  const result = await safeAction(() => deleteTaskAction(taskId));

  if (!result.success) {
    toast.error('Failed to delete task: ' + result.error);
    return false;
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return false;
  }

  toast.success('Task deleted successfully');
  return true;
}

/**
 * Opens edit modal for a task (fetches current data)
 */
export async function handleEditTask(taskId: string): Promise<Task | null> {
  const result = await safeAction(() => editTaskAction(taskId));

  if (!result.success) {
    toast.error('Failed to fetch task for editing: ' + result.error);
    return null;
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return null;
  }

  return result.data?.data ?? null;
}

/**
 * Saves edits to a task (employee assignment, due date)
 */
export async function handleSaveTaskEdit(
  taskId: string,
  updatedData: Partial<Task>
): Promise<Task | null> {
  const result = await safeAction(() => saveTaskEditAction(taskId, updatedData));

  if (!result.success) {
    toast.error('Failed to save task edits: ' + result.error);
    return null;
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return null;
  }

  toast.success('Task updated successfully');
  return result.data?.data ?? null;
}

/**
 * Removes a single task from an employee card
 */
export async function handleRemoveTaskFromEmployee(
  employeeId: string,
  taskId: string
): Promise<Employee | null> {
  const result = await safeAction(() =>
    removeTaskFromEmployeeAction(employeeId, taskId)
  );

  if (!result.success) {
    toast.error('Failed to remove task from employee: ' + result.error);
    return null;
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return null;
  }

  toast.success('Task removed from employee');
  return result.data?.data ?? null;
}

/**
 * Clears all tasks assigned to an employee (removes employee card)
 */
export async function handleClearEmployeeTasks(
  employeeId: string
): Promise<boolean> {
  const result = await safeAction(() => clearEmployeeTasksAction(employeeId));

  if (!result.success) {
    toast.error('Failed to clear employee tasks: ' + result.error);
    return false;
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return false;
  }

  toast.success('Employee tasks cleared successfully');
  return true;
}

/**
 * Fetches paginated tasks
 */
export async function handleFetchTasksPaginated(
  page: number = 1
): Promise<PaginatedResponse<Task>> {
  const result = await safeAction(() => fetchTasksPaginated(page));

  if (!result.success) {
    toast.error('Failed to load tasks: ' + result.error);
    return { data: [], count: 0, totalPages: 0 };
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return { data: [], count: 0, totalPages: 0 };
  }

  return result.data?.data ?? { data: [], count: 0, totalPages: 0 };
}

/**
 * Fetches paginated employees
 */
export async function handleFetchEmployeesPaginated(
  page: number = 1
): Promise<PaginatedResponse<Employee>> {
  const result = await safeAction(() => fetchEmployeesPaginated(page));

  if (!result.success) {
    toast.error('Failed to load employees: ' + result.error);
    return { data: [], count: 0, totalPages: 0 };
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return { data: [], count: 0, totalPages: 0 };
  }

  return result.data?.data ?? { data: [], count: 0, totalPages: 0 };
}
