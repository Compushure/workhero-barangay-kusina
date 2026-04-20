/**
 * Test coverage:
 * - Employee task action handlers (fetch, submit, claim, redo, serve, perform-more)
 * - Employee task helper selectors and status labels
 * - Edge branches for action wrapper failures and action-returned errors
 * Run this file only: npm test -- --runTestsByPath __tests___/unit/employee/tasks.test.ts
 */

import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  canClaimRewards,
  canSubmitForVerification,
  getTaskStatusText,
  getTasksByStatus,
  handleClaimTaskPointsAndXP,
  handleFetchEmployeeTasks,
  handlePerformMoreOrders,
  handleRedoTask,
  handleServeCookedTaskDish,
  handleSubmitTaskVerification,
} from '@/action-handlers/employee/tasks';
import type { ClaimTaskResult, SubmitVerificationResult } from '@/actions/employee/tasks';
import { employeeTaskStatusMockData, employeeTasksDataMock } from '../../mockData/employeeTaskMockData';

type SafeActionResult = {
  success: boolean;
  data: unknown;
  error: string | null;
};

const toastError = jest.fn();

jest.mock('@/lib/utils/safe-action', () => ({
  safeAction: jest.fn(),
}));

jest.mock('@/actions/employee/tasks', () => ({
  fetchEmployeeTasks: jest.fn(),
  submitTaskVerification: jest.fn(),
  claimTaskPointsAndXP: jest.fn(),
  serveCookedTaskDish: jest.fn(),
  redoTask: jest.fn(),
  performMoreOrders: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
  },
}));

const { safeAction } = jest.requireMock('@/lib/utils/safe-action') as {
  safeAction: jest.MockedFunction<(action: () => Promise<unknown>) => Promise<SafeActionResult>>;
};

const taskActions = jest.requireMock('@/actions/employee/tasks') as {
  fetchEmployeeTasks: jest.MockedFunction<() => Promise<unknown>>;
  submitTaskVerification: jest.MockedFunction<
    (kpitaskId: string, pendingOrders: number) => Promise<unknown>
  >;
  claimTaskPointsAndXP: jest.MockedFunction<(kpitaskId: string) => Promise<unknown>>;
  serveCookedTaskDish: jest.MockedFunction<(kpitaskId: string) => Promise<unknown>>;
  redoTask: jest.MockedFunction<(kpitaskId: string) => Promise<unknown>>;
  performMoreOrders: jest.MockedFunction<(kpitaskId: string) => Promise<unknown>>;
};

beforeEach(() => {
  toastError.mockReset();

  safeAction.mockReset();
  safeAction.mockImplementation(async (action) => ({
    success: true,
    data: await action(),
    error: null,
  }));

  taskActions.fetchEmployeeTasks.mockResolvedValue({ error: null, data: employeeTasksDataMock });
  taskActions.submitTaskVerification.mockResolvedValue({
    error: null,
    data: { success: true, pendingOrdersSubmitted: 2 },
  });
  taskActions.claimTaskPointsAndXP.mockResolvedValue({
    error: null,
    data: {
      pointsAdded: 20,
      xpAdded: 7,
      cookOutcome: {
        canPrepareFood: false,
        orderCount: 1,
        maxOrders: 3,
        dish: null,
      },
    },
  });
  taskActions.redoTask.mockResolvedValue({ error: null, data: true });
  taskActions.performMoreOrders.mockResolvedValue({ error: null, data: true });
  taskActions.serveCookedTaskDish.mockResolvedValue({ error: null, data: true });
});

describe('When employee task handlers run on happy paths', () => {
  test('Then handleFetchEmployeeTasks returns grouped tasks from the action wrapper', async () => {
    const result = await handleFetchEmployeeTasks();

    expect(result).toEqual(employeeTasksDataMock);
    expect(taskActions.fetchEmployeeTasks).toHaveBeenCalledTimes(1);
    expect(toastError).not.toHaveBeenCalled();
  });

  test('Then handleSubmitTaskVerification returns the submission payload', async () => {
    const result = await handleSubmitTaskVerification('task-123', 2);

    expect(result).toEqual({
      success: true,
      pendingOrdersSubmitted: 2,
    } as SubmitVerificationResult);
    expect(taskActions.submitTaskVerification).toHaveBeenCalledWith('task-123', 2);
    expect(toastError).not.toHaveBeenCalled();
  });

  test('Then handleClaimTaskPointsAndXP returns reward data for a claimable task', async () => {
    const result = await handleClaimTaskPointsAndXP('task-claim', 'Task Name', 1, 1, 3);

    expect(result).toEqual({
      pointsAdded: 20,
      xpAdded: 7,
      cookOutcome: {
        canPrepareFood: false,
        orderCount: 1,
        maxOrders: 3,
        dish: null,
      },
    } as ClaimTaskResult);
    expect(taskActions.claimTaskPointsAndXP).toHaveBeenCalledWith('task-claim');
  });

  test('Then handleRedoTask, handlePerformMoreOrders, and handleServeCookedTaskDish all return success', async () => {
    const redo = await handleRedoTask('task-redo');
    const performMore = await handlePerformMoreOrders('task-more');
    const serve = await handleServeCookedTaskDish('task-serve');

    expect(redo).toBe(true);
    expect(performMore).toBe(true);
    expect(serve).toBe(true);
    expect(toastError).not.toHaveBeenCalled();
  });
});

describe('When employee task handlers hit edge failures', () => {
  test('Then handleFetchEmployeeTasks returns null and shows a fallback toast on safeAction failure', async () => {
    safeAction.mockResolvedValueOnce({ success: false, data: null, error: 'gateway timeout' });

    const result = await handleFetchEmployeeTasks();

    expect(result).toBeNull();
    expect(toastError).toHaveBeenCalledWith('Failed to load tasks');
  });

  test('Then handleSubmitTaskVerification surfaces action-level errors from the server action response', async () => {
    taskActions.submitTaskVerification.mockResolvedValueOnce({
      error: 'unable to submit overdue tasks',
      data: undefined,
    });

    const result = await handleSubmitTaskVerification('task-overdue', 1);

    expect(result).toBeNull();
    expect(toastError).toHaveBeenCalledWith('unable to submit overdue tasks');
  });

  test('Then handlePerformMoreOrders surfaces a safeAction transport error', async () => {
    safeAction.mockResolvedValueOnce({
      success: false,
      data: null,
      error: 'service unavailable',
    });

    const result = await handlePerformMoreOrders('task-more');

    expect(result).toBeNull();
    expect(toastError).toHaveBeenCalledWith('service unavailable');
  });

  test('Then handleServeCookedTaskDish surfaces server-action validation errors', async () => {
    taskActions.serveCookedTaskDish.mockResolvedValueOnce({
      error: 'Only approved tasks can be served',
      data: undefined,
    });

    const result = await handleServeCookedTaskDish('task-not-approved');

    expect(result).toBeNull();
    expect(toastError).toHaveBeenCalledWith('Only approved tasks can be served');
  });
});

describe('When helper utilities evaluate task state', () => {
  test('Then getTasksByStatus returns the expected section and handles missing data safely', () => {
    expect(getTasksByStatus(employeeTasksDataMock, 'current')).toEqual(employeeTasksDataMock.currentTasks);
    expect(getTasksByStatus(employeeTasksDataMock, 'onReview')).toEqual(employeeTasksDataMock.onReviewTasks);
    expect(getTasksByStatus(employeeTasksDataMock, 'verified')).toEqual(employeeTasksDataMock.verifiedTasks);
    expect(getTasksByStatus(employeeTasksDataMock, 'denied')).toEqual(employeeTasksDataMock.deniedTasks);
    expect(getTasksByStatus(null, 'current')).toEqual([]);
  });

  test('Then canSubmitForVerification and canClaimRewards respect status-driven guards', () => {
    expect(canSubmitForVerification(employeeTaskStatusMockData.assigned)).toBe(true);
    expect(
      canSubmitForVerification({
        ...employeeTaskStatusMockData.assigned,
        claimedAt: '2026-04-01T00:00:00.000Z',
      })
    ).toBe(false);

    expect(canClaimRewards(employeeTaskStatusMockData.approvedClaimable)).toBe(true);
    expect(canClaimRewards(employeeTaskStatusMockData.rejected)).toBe(false);
  });

  test('Then getTaskStatusText prioritizes claimed state and covers unknown statuses', () => {
    expect(
      getTaskStatusText({
        ...employeeTaskStatusMockData.approvedClaimable,
        claimedAt: '2026-04-01T00:00:00.000Z',
      })
    ).toBe('Claimed');
    expect(getTaskStatusText(employeeTaskStatusMockData.assigned)).toBe('In Progress');
    expect(getTaskStatusText(employeeTaskStatusMockData.inReview)).toBe('Under Review');
    expect(getTaskStatusText(employeeTaskStatusMockData.approvedClaimable)).toBe('Approved');
    expect(getTaskStatusText(employeeTaskStatusMockData.rejected)).toBe('Rejected');
    expect(getTaskStatusText({ ...employeeTaskStatusMockData.assigned, status: 'mystery-state' })).toBe(
      'Unknown'
    );
  });
});
