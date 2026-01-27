import { safeAction } from '@/lib/utils/safe-action';
import {
  fetchCurrentAssignedTasksPaginated, // ✅ use only the paginated fetch
  fetchCurrentAssignedEmployeesPaginated, // ✅ new employee-specific fetch
  clearAllTasks,
  deleteTask,
  updateTaskAssignment,
} from '@/actions/manager-current-assigned-task';
import { toast } from 'sonner';
import type { AssignedTask, ServerActionResponse } from '@/types';

/**
 * ✅ Handler for paginated fetch of current assigned tasks
 */
export async function handleFetchCurrentAssignedTasksPaginated(
  page: number = 1,
  pageSize: number = 4,
  sortBy: string = 'recently added',
  searchTerm: string = ''
): Promise<{ tasks: AssignedTask[]; count: number; totalPages: number }> {
  const result = await safeAction<
    ServerActionResponse<{ data: AssignedTask[]; count: number; totalPages: number }>
  >(() => fetchCurrentAssignedTasksPaginated(page, pageSize, sortBy, searchTerm));

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return { tasks: [], count: 0, totalPages: 0 };
  }

  const payload = result.data?.data;
  return {
    tasks: payload?.data ?? [],
    count: payload?.count ?? 0,
    totalPages: payload?.totalPages ?? 0,
  };
}

/**
 * Clear all tasks
 */
export async function handleClearAllTasks(): Promise<boolean> {
  const result = await safeAction<ServerActionResponse<boolean>>(() => clearAllTasks());

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return false;
  }

  toast.success('All tasks cleared');
  return true;
}

/**
 * Delete a single task
 */
export async function handleDeleteTask(taskId: string): Promise<boolean> {
  const result = await safeAction<ServerActionResponse<boolean>>(() => deleteTask(taskId));

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return false;
  }

  toast.success('Task deleted');
  return true;
}

/**
 * ✅ Handler for paginated fetch of current assigned tasks for EMPLOYEE view
 */
export async function handleFetchCurrentAssignedEmployeesPaginated(
  page: number = 1,
  pageSize: number = 4,
  sortBy: string = 'recently added',
  searchTerm: string = ''
): Promise<{ tasks: AssignedTask[]; count: number; totalPages: number }> {
  const result = await safeAction<
    ServerActionResponse<{ data: AssignedTask[]; count: number; totalPages: number }>
  >(() => fetchCurrentAssignedEmployeesPaginated(page, pageSize, sortBy, searchTerm));

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return { tasks: [], count: 0, totalPages: 0 };
  }

  const payload = result.data?.data;
  return {
    tasks: payload?.data ?? [],
    count: payload?.count ?? 0,
    totalPages: payload?.totalPages ?? 0,
  };
}

/**
 * Update task assignment
 */
export async function handleUpdateTaskAssignment(
  taskId: string,
  maxOrders: number,
  newDueDate: string,
  employeeIds: string[]
): Promise<boolean> {
  const result = await safeAction<ServerActionResponse<boolean>>(() =>
    updateTaskAssignment(taskId, maxOrders, newDueDate, employeeIds)
  );

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return false;
  }

  toast.success('Task updated successfully');
  return true;
}
