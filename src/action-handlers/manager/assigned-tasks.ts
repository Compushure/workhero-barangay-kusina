import { safeAction } from '@/lib/utils/safe-action';
import {
  fetchCurrentAssignedTasksPaginated, // ✅ use only the paginated fetch
  fetchCurrentAssignedEmployeesPaginated, // ✅ new employee-specific fetch
  clearUnstartedTaskAssignments,
  clearUnstartedEmployeeTasks,
  deleteTask,
  deleteTaskForAllEmployees,
  updateTaskAssignment,
} from '@/actions/manager/assigned-tasks';
import { toast } from 'sonner';
import type { AssignedTask, ServerActionResponse } from '@/types';

function formatUnstartedAssignmentsToastMessage(count: number): string {
  const assignmentLabel = count === 1 ? 'task assignment' : 'task assignments';
  const verb = count === 1 ? 'was' : 'were';
  return `${count} unstarted ${assignmentLabel} ${verb} deleted`;
}

function formatUnstartedTasksToastMessage(count: number): string {
  const taskLabel = count === 1 ? 'task' : 'tasks';
  const verb = count === 1 ? 'was' : 'were';
  return `${count} unstarted ${taskLabel} ${verb} deleted`;
}

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
export async function handleClearUnstartedTaskAssignments(): Promise<number> {
  const result = await safeAction<ServerActionResponse<number>>(() =>
    clearUnstartedTaskAssignments()
  );

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return 0;
  }

  const clearedCount = result.data?.data ?? 0;
  const toastMessage = formatUnstartedAssignmentsToastMessage(clearedCount);

  if (clearedCount === 0) {
    toast.info(toastMessage);
    return 0;
  }

  toast.success(toastMessage);
  return clearedCount;
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
  const toastMessage = formatUnstartedTasksToastMessage(clearedCount);

  if (clearedCount === 0) {
    toast.info(toastMessage);
    return 0;
  }

  toast.success(toastMessage);
  return clearedCount;
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

  toast.success('Employee unassigned from Task');
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

  toast.success('Task updated');
  return true;
}
