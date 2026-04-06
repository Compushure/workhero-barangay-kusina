/**
 * Test scope: Unit tests for manager task verification server actions and action handlers.
 * Run this file only: npm test -- --runTestsByPath __tests___/unit/manager/task-verification.test.ts
 */

import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  approvalRemarkMockData,
  rejectionRemarkMockData,
  verificationTaskMockData,
} from '../../mockData/managerTaskVerificationMockData';
import {
  approveTaskAction,
  fetchApprovedTasks,
  fetchDeniedTasks,
  fetchTasksToReview,
  fetchTasksToReviewPaginated,
  rejectTaskAction,
} from '@/actions/manager/verification';
import {
  handleApproveTask,
  handleFetchApprovedTasksPaginated,
  handleFetchDeniedTasksPaginated,
  handleFetchTasksToReview,
  handleRejectTask,
} from '@/action-handlers/manager/verification';

type CreateClientFn = () => Promise<unknown>;
type InsertNotificationFn = typeof import('@/lib/notifications').insertNotification;
type ToastFn = (message?: unknown) => unknown;
type QueryError = { message: string } | null;
type QueryResult = { data: unknown; error: QueryError; count?: number };
type QueryBuilder = PromiseLike<QueryResult> & {
  eq: (field: string, value: string) => QueryBuilder;
  or: (filters: string) => QueryBuilder;
  order: (field: string, options?: Record<string, unknown>) => QueryBuilder;
  range: (from: number, to: number) => QueryResult;
  single: () => Promise<QueryResult>;
};

let mockSupabaseClient: unknown;

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/notifications', () => ({
  insertNotification: jest.fn(async () => undefined),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const { createClient } = jest.requireMock('@/lib/supabase/server') as {
  createClient: jest.MockedFunction<CreateClientFn>;
};
const createClientMock = createClient;

const { insertNotification } = jest.requireMock('@/lib/notifications') as {
  insertNotification: jest.MockedFunction<InsertNotificationFn>;
};
const insertNotificationMock = insertNotification;

const { toast } = jest.requireMock('sonner') as {
  toast: {
    success: jest.MockedFunction<ToastFn>;
    error: jest.MockedFunction<ToastFn>;
  };
};
const toastSuccess = toast.success;
const toastError = toast.error;

// Recreate the chainable query API returned by Supabase.
function createThenableBuilder(result: QueryResult): QueryBuilder {
  const builder = {} as QueryBuilder;

  builder.eq = jest.fn(() => builder);
  builder.or = jest.fn(() => builder);
  builder.order = jest.fn(() => builder);
  builder.range = jest.fn(() => result);
  builder.single = jest.fn(async () => result);
  builder.then = (onfulfilled, onrejected) =>
    Promise.resolve(result).then(onfulfilled, onrejected);

  return builder;
}

// Creates a mock client that can return task-view reads and task table updates.
function createVerificationClient(overrides?: {
  taskDetailsResult?: QueryResult;
  updatedTaskResult?: QueryResult;
  updateResult?: { error: QueryError };
}) {
  return {
    from: jest.fn((table: string) => {
      if (table === 'task_info_view') {
        return {
          // Switch result shapes based on the selected columns.
          select: jest.fn((selection?: string) => {
            if (selection?.includes('completed_orders')) {
              return createThenableBuilder(
                overrides?.taskDetailsResult || {
                  data: {
                    completed_orders: 2,
                    pending_orders: 1,
                    max_orders: 5,
                  },
                  error: null,
                }
              );
            }

            return createThenableBuilder(
              overrides?.updatedTaskResult || {
                data: [verificationTaskMockData],
                error: null,
                count: 1,
              }
            );
          }),
        };
      }

      if (table === 'KPITask') {
        return {
          update: jest.fn(() => ({
            eq: jest.fn(async () => overrides?.updateResult || { error: null }),
          })),
        };
      }

      throw new Error(`Unexpected table ${table}`);
    }),
  };
}

beforeEach(() => {
  createClientMock.mockClear();
  insertNotificationMock.mockClear();
  toastSuccess.mockReset();
  toastError.mockReset();
  createClientMock.mockImplementation(async () => mockSupabaseClient);
  // Each test starts with a clean mock client.
  mockSupabaseClient = createVerificationClient();
});

describe('When the manager loads tasks that need review', () => {
  test('Then the fetchTasksToReview action returns the in-review tasks from the task view', async () => {
    mockSupabaseClient = {
      from: jest.fn(() => ({
        select: jest.fn(() =>
          createThenableBuilder({
            data: [verificationTaskMockData],
            error: null,
          })
        ),
      })),
    };

    const result = await fetchTasksToReview();

    expect(result.error).toBeNull();
    expect(result.data).toEqual([verificationTaskMockData]);
  });

  test('Then the fetchTasksToReviewPaginated action returns paginated data and total pages', async () => {
    mockSupabaseClient = {
      from: jest.fn(() => ({
        select: jest.fn(() =>
          createThenableBuilder({
            data: [verificationTaskMockData],
            error: null,
            count: 12,
          })
        ),
      })),
    };

    const result = await fetchTasksToReviewPaginated(2, 5, 'EMP-001', 'date-desc');

    expect(result.error).toBeNull();
    expect(result.data?.count).toBe(12);
    expect(result.data?.totalPages).toBe(3);
    expect(result.data?.data[0].kpitask_id).toBe(verificationTaskMockData.kpitask_id);
  });

  test('Then the handleFetchTasksToReview handler returns an empty list and shows a toast when the action fails', async () => {
    const actionSpy = jest
      .spyOn(await import('@/actions/manager/verification'), 'fetchTasksToReview')
      .mockResolvedValueOnce({ error: 'Failed to fetch tasks in review' });

    const result = await handleFetchTasksToReview();

    expect(result).toEqual([]);
    expect(toastError).toHaveBeenCalledWith('Failed to fetch tasks in review');
    actionSpy.mockRestore();
  });
});

describe('When the manager loads approved or rejected tasks', () => {
  test('Then the approved and denied task actions return the expected task collections', async () => {
    const approvedTask = { ...verificationTaskMockData, status: 'approved' };
    const deniedTask = { ...verificationTaskMockData, status: 'rejected' };

    mockSupabaseClient = {
      from: jest.fn(() => {
        const builder = createThenableBuilder({
          data: [approvedTask],
          error: null,
          count: 1,
        });

        builder.eq = jest.fn((_field: string, value: string) =>
          createThenableBuilder({
            data: [value === 'approved' ? approvedTask : deniedTask],
            error: null,
            count: 1,
          })
        );

        return {
          select: jest.fn(() => builder),
        };
      }),
    };

    const approvedResult = await fetchApprovedTasks();
    const deniedResult = await fetchDeniedTasks();

    expect(approvedResult.data?.[0].status).toBe('approved');
    expect(deniedResult.data?.[0].status).toBe('rejected');
  });

  test('Then the paginated approved and denied task handlers return fallback pagination when the action fails', async () => {
    const approvedSpy = jest
      .spyOn(await import('@/actions/manager/verification'), 'fetchApprovedTasksPaginated')
      .mockResolvedValueOnce({ error: 'Failed to fetch approved tasks' });
    const deniedSpy = jest
      .spyOn(await import('@/actions/manager/verification'), 'fetchDeniedTasksPaginated')
      .mockResolvedValueOnce({ error: 'Failed to fetch rejected tasks' });

    const approved = await handleFetchApprovedTasksPaginated();
    const denied = await handleFetchDeniedTasksPaginated();

    expect(approved).toEqual({ data: [], count: 0, totalPages: 0 });
    expect(denied).toEqual({ data: [], count: 0, totalPages: 0 });
    expect(toastError).toHaveBeenCalledWith('Failed to fetch approved tasks');
    expect(toastError).toHaveBeenCalledWith('Failed to fetch rejected tasks');
    approvedSpy.mockRestore();
    deniedSpy.mockRestore();
  });
});

describe('When the manager approves a task submission', () => {
  test('Then the approveTaskAction updates the task, clears pending orders, and creates a notification', async () => {
    const approvedTask = {
      ...verificationTaskMockData,
      status: 'approved',
      remark: approvalRemarkMockData,
      pending_orders: 0,
      completed_orders: 3,
    };

    mockSupabaseClient = createVerificationClient({
      updatedTaskResult: {
        data: approvedTask,
        error: null,
      },
    });

    const result = await approveTaskAction(
      verificationTaskMockData.kpitask_id,
      approvalRemarkMockData
    );

    expect(result.error).toBeNull();
    expect(result.data?.status).toBe('approved');
    expect(insertNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: verificationTaskMockData.assigned_to,
        type: 'task',
      })
    );
  });

  test('Then the handleApproveTask handler returns null and shows a toast when the action fails', async () => {
    const actionSpy = jest
      .spyOn(await import('@/actions/manager/verification'), 'approveTaskAction')
      .mockResolvedValueOnce({ error: 'Failed to approve task' });

    const result = await handleApproveTask(
      verificationTaskMockData.kpitask_id,
      approvalRemarkMockData
    );

    expect(result).toBeNull();
    expect(toastError).toHaveBeenCalledWith('Failed to approve task');
    actionSpy.mockRestore();
  });
});

describe('When the manager rejects a task submission', () => {
  test('Then the rejectTaskAction updates the task and creates a rejection notification', async () => {
    const rejectedTask = {
      ...verificationTaskMockData,
      status: 'rejected',
      remark: rejectionRemarkMockData,
      pending_orders: 0,
    };

    mockSupabaseClient = createVerificationClient({
      updatedTaskResult: {
        data: rejectedTask,
        error: null,
      },
    });

    const result = await rejectTaskAction(
      verificationTaskMockData.kpitask_id,
      rejectionRemarkMockData
    );

    expect(result.error).toBeNull();
    expect(result.data?.status).toBe('rejected');
    expect(insertNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: verificationTaskMockData.assigned_to,
        type: 'task',
      })
    );
  });

  test('Then the handleRejectTask handler returns null and shows a toast when the action fails', async () => {
    const actionSpy = jest
      .spyOn(await import('@/actions/manager/verification'), 'rejectTaskAction')
      .mockResolvedValueOnce({ error: 'Failed to reject task' });

    const result = await handleRejectTask(
      verificationTaskMockData.kpitask_id,
      rejectionRemarkMockData
    );

    expect(result).toBeNull();
    expect(toastError).toHaveBeenCalledWith('Failed to reject task');
    actionSpy.mockRestore();
  });
});
