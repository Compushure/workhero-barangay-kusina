import { safeAction } from '@/lib/utils/safe-action';
import {
  fetchCurrentAssignedTasksPaginated, // ✅ use only the paginated fetch
  fetchCurrentAssignedEmployeesPaginated, // ✅ new employee-specific fetch
  clearUnstartedTaskAssignments,
  clearUnstartedEmployeeTasks,
  clearAllEmployeeTasks,
  deleteTask,
  deleteTaskForAllEmployees,
  updateTaskAssignment,
} from '@/actions/manager/assigned-tasks';
import { toast } from 'sonner';
import type { AssignedTask, ServerActionResponse } from '@/types';

/**
 * ✅ Handler for paginated fetch of current assigned tasks
 */
export async function handleFetchCurrentAssignedTasksPaginated(
  page: number = 1,
  pageSize: number = 10,
  sortBy: string = 'recently added',
  searchTerm: string = '',
  statusFilters: string[] = [],
  overdueFilter: string = 'hide-overdue'
): Promise<{ tasks: AssignedTask[]; count: number; totalPages: number; employeeCount: number }> {
  const result = await safeAction<
    ServerActionResponse<{
      data: AssignedTask[];
      count: number;
      totalPages: number;
      employeeCount: number;
    }>
  >(() =>
    fetchCurrentAssignedTasksPaginated(
      page,
      pageSize,
      sortBy,
      searchTerm,
      statusFilters,
      overdueFilter
    )
  );

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return { tasks: [], count: 0, totalPages: 0, employeeCount: 0 };
  }

  const payload = result.data?.data;
  return {
    tasks: payload?.data ?? [],
    count: payload?.count ?? 0,
    totalPages: payload?.totalPages ?? 0,
    employeeCount: payload?.employeeCount ?? 0,
  };
}

/**
 * ✅ Handler for paginated fetch of current assigned tasks for EMPLOYEE view
 */
export async function handleFetchCurrentAssignedEmployeesPaginated(
  page: number = 1,
  pageSize: number = 10,
  sortBy: string = 'recently added',
  searchTerm: string = '',
  statusFilters: string[] = [],
  overdueFilter: string = 'hide-overdue'
): Promise<{ tasks: AssignedTask[]; count: number; totalPages: number; taskCount: number }> {
  const result = await safeAction<
    ServerActionResponse<{
      data: AssignedTask[];
      count: number;
      totalPages: number;
      taskCount: number;
    }>
  >(() =>
    fetchCurrentAssignedEmployeesPaginated(
      page,
      pageSize,
      sortBy,
      searchTerm,
      statusFilters,
      overdueFilter
    )
  );

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return { tasks: [], count: 0, totalPages: 0, taskCount: 0 };
  }

  const payload = result.data?.data;
  return {
    tasks: payload?.data ?? [],
    count: payload?.count ?? 0,
    totalPages: payload?.totalPages ?? 0,
    taskCount: payload?.taskCount ?? 0,
  };
}

/**
 * Clear unstarted (no progress) assigned tasks
 */
export async function handleClearUnstartedTaskAssignments(): Promise<boolean> {
  const result = await safeAction<ServerActionResponse<boolean>>(() =>
    clearUnstartedTaskAssignments()
  );

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return false;
  }

  toast.success('Unstarted assignments cleared');
  return true;
}

/**
 * Clear unstarted tasks for a specific employee
 */
export async function handleClearUnstartedEmployeeTasks(employeeId: string): Promise<number> {
  const result = await safeAction<ServerActionResponse<number>>(() =>
    clearUnstartedEmployeeTasks(employeeId)
  );

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return 0;
  }

  const clearedCount = result.data?.data ?? 0;

  if (clearedCount === 0) {
    toast.info('No unstarted tasks to clear for this employee');
    return 0;
  }

  toast.success(`Cleared ${clearedCount} unstarted task${clearedCount === 1 ? '' : 's'}`);
  return clearedCount;
}

/**
 * Clear ALL tasks for a specific employee (even if started), keeps toast feedback consistent
 */
export async function handleClearAllEmployeeTasks(employeeId: string): Promise<boolean> {
  const result = await safeAction<ServerActionResponse<boolean>>(() =>
    clearAllEmployeeTasks(employeeId)
  );

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return false;
  }

  toast.success('All tasks for this employee have been cleared');
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
 * Delete all task assignments for a task group
 */
export async function handleDeleteTaskForAllEmployees(
  categoryId: string,
  deadlineDate: string,
  maxOrders: number,
  createdAt: string
): Promise<boolean> {
  const result = await safeAction<ServerActionResponse<boolean>>(() =>
    deleteTaskForAllEmployees(categoryId, deadlineDate, maxOrders, createdAt)
  );

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return false;
  }

  toast.success('Task deleted');
  return true;
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
