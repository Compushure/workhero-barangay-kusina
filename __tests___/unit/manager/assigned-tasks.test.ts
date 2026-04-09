/**
 * Test coverage:
 * - Fetch current assigned tasks (task view) through handler
 * - Fetch current assigned tasks (employee view) through handler
 * - Clear unstarted tasks for a specific employee through handler
 * - Delete a single assigned task through handler
 * Run this file only: npm test -- --runTestsByPath __tests___/unit/manager/assigned-tasks.test.ts
 */

import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import {
  handleClearUnstartedEmployeeTasks,
  handleDeleteTask,
  handleFetchCurrentAssignedEmployeesPaginated,
  handleFetchCurrentAssignedTasksPaginated,
} from '@/action-handlers/manager/assigned-tasks';
import type { AssignedTask } from '@/types';
import type { ServerActionResponse } from '@/types';
import { createAssignedTaskMockData } from '../../mockData/managerAssignedTasksMockData';

type SafeActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };

type AssignedTaskPaginatedResponse = ServerActionResponse<{
  data: AssignedTask[];
  count: number;
  totalPages: number;
  employeeCount: number;
}>;

type AssignedEmployeePaginatedResponse = ServerActionResponse<{
  data: AssignedTask[];
  count: number;
  totalPages: number;
  taskCount: number;
}>;

type FetchCurrentAssignedTasksFn = (
  page?: number,
  pageSize?: number,
  sortBy?: string,
  searchTerm?: string,
  statusFilters?: string[],
  overdueFilter?: string
) => Promise<AssignedTaskPaginatedResponse>;

type FetchCurrentAssignedEmployeesFn = (
  page?: number,
  pageSize?: number,
  sortBy?: string,
  searchTerm?: string,
  statusFilters?: string[],
  overdueFilter?: string
) => Promise<AssignedEmployeePaginatedResponse>;

type ClearUnstartedEmployeeTasksFn = (employeeId: string) => Promise<ServerActionResponse<number>>;
type DeleteTaskFn = (taskId: string) => Promise<ServerActionResponse<boolean>>;

const fetchCurrentAssignedTasksPaginatedMock: jest.MockedFunction<FetchCurrentAssignedTasksFn> =
  jest.fn();
const fetchCurrentAssignedEmployeesPaginatedMock: jest.MockedFunction<FetchCurrentAssignedEmployeesFn> =
  jest.fn();
const clearUnstartedEmployeeTasksMock: jest.MockedFunction<ClearUnstartedEmployeeTasksFn> =
  jest.fn();
const deleteTaskMock: jest.MockedFunction<DeleteTaskFn> = jest.fn();
const safeActionMock = jest.fn();

jest.mock('@/actions/manager/assigned-tasks', () => ({
  fetchCurrentAssignedTasksPaginated: (
    page?: number,
    pageSize?: number,
    sortBy?: string,
    searchTerm?: string,
    statusFilters?: string[],
    overdueFilter?: string
  ) =>
    fetchCurrentAssignedTasksPaginatedMock(
      page,
      pageSize,
      sortBy,
      searchTerm,
      statusFilters,
      overdueFilter
    ),
  fetchCurrentAssignedEmployeesPaginated: (
    page?: number,
    pageSize?: number,
    sortBy?: string,
    searchTerm?: string,
    statusFilters?: string[],
    overdueFilter?: string
  ) =>
    fetchCurrentAssignedEmployeesPaginatedMock(
      page,
      pageSize,
      sortBy,
      searchTerm,
      statusFilters,
      overdueFilter
    ),
  clearUnstartedEmployeeTasks: (employeeId: string) => clearUnstartedEmployeeTasksMock(employeeId),
  clearUnstartedTaskAssignments: jest.fn(),
  deleteTask: (taskId: string) => deleteTaskMock(taskId),
  deleteTaskForAllEmployees: jest.fn(),
  updateTaskAssignment: jest.fn(),
}));

jest.mock('@/lib/utils/safe-action', () => ({
  safeAction: (...args: unknown[]) => safeActionMock(...args),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

const { toast } = jest.requireMock('sonner') as {
  toast: {
    success: jest.MockedFunction<(message?: unknown) => unknown>;
    error: jest.MockedFunction<(message?: unknown, options?: unknown) => unknown>;
    info: jest.MockedFunction<(message?: unknown, options?: unknown) => unknown>;
  };
};

beforeEach(() => {
  fetchCurrentAssignedTasksPaginatedMock.mockReset();
  fetchCurrentAssignedEmployeesPaginatedMock.mockReset();
  clearUnstartedEmployeeTasksMock.mockReset();
  deleteTaskMock.mockReset();
  safeActionMock.mockReset();

  toast.success.mockReset();
  toast.error.mockReset();
  toast.info.mockReset();

  safeActionMock.mockImplementation(async (...args: unknown[]) => {
    const fn = args[0] as () => Promise<unknown>;
    try {
      const data = await fn();
      return { success: true, data, error: null } satisfies SafeActionResult<unknown>;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      } satisfies SafeActionResult<null>;
    }
  });
});

describe('When the manager loads assigned-task data through handlers', () => {
  test('Then task-view pagination handler returns assigned-task payload without error toast', async () => {
    fetchCurrentAssignedTasksPaginatedMock.mockResolvedValue({
      error: null,
      data: {
        data: [createAssignedTaskMockData('task-1', 'employee-1')],
        count: 1,
        totalPages: 1,
        employeeCount: 1,
      },
    } satisfies ServerActionResponse<{
      data: AssignedTask[];
      count: number;
      totalPages: number;
      employeeCount: number;
    }>);

    const result = await handleFetchCurrentAssignedTasksPaginated(1, 10, 'recently added');

    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0].id).toBe('task-1');
    expect(result.count).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.employeeCount).toBe(1);
    expect(toast.error).not.toHaveBeenCalled();
  });

  test('Then employee-view pagination handler returns assigned-task payload without error toast', async () => {
    fetchCurrentAssignedEmployeesPaginatedMock.mockResolvedValue({
      error: null,
      data: {
        data: [createAssignedTaskMockData('task-2', 'employee-2')],
        count: 1,
        totalPages: 1,
        taskCount: 1,
      },
    } satisfies ServerActionResponse<{
      data: AssignedTask[];
      count: number;
      totalPages: number;
      taskCount: number;
    }>);

    const result = await handleFetchCurrentAssignedEmployeesPaginated(1, 10, 'recently added');

    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0].id).toBe('task-2');
    expect(result.count).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.taskCount).toBe(1);
    expect(toast.error).not.toHaveBeenCalled();
  });
});

describe('When the manager clears or deletes assigned tasks through handlers', () => {
  test('Then clear-unstarted-by-employee handler returns cleared count and shows success toast', async () => {
    clearUnstartedEmployeeTasksMock.mockResolvedValue({
      error: null,
      data: 2,
    } satisfies ServerActionResponse<number>);

    const clearedCount = await handleClearUnstartedEmployeeTasks('employee-1');

    expect(clearedCount).toBe(2);
    expect(toast.success).toHaveBeenCalledWith('Cleared 2 unstarted tasks');
  });

  test('Then delete-task handler returns false and shows an error toast when action fails', async () => {
    deleteTaskMock.mockResolvedValue({
      error: 'Delete failed',
      data: undefined,
    } satisfies ServerActionResponse<boolean>);

    const deleted = await handleDeleteTask('task-1');

    expect(deleted).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Delete failed');
  });
});
