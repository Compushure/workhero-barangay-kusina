/**
 *  WARNING: MAKE SURE YOU HAVE THE RIGHT ENV FOR THE TEST DB DIOS MIOKO
 * Test coverage:
 * - Load remote tasks awaiting review
 * - Load remote approved and denied tasks
 * - Load remote paginated review results
 * - Approve and reject remote task submissions
 * - Verify the matching remote action handlers for task verification
 * Run this file only: npm test -- --runTestsByPath __tests___/integration/manager/task-verification.integration.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  approvalRemarkMockData,
  rejectionRemarkMockData,
} from '../../mockData/managerTaskVerificationMockData';
import {
  handleApproveTask,
  handleFetchApprovedTasksPaginated,
  handleFetchDeniedTasksPaginated,
  handleFetchTasksToReview,
  handleFetchTasksToReviewPaginated,
  handleRejectTask,
} from '@/action-handlers/manager/verification';
import { RemoteSupabaseTestContext } from '../../utils/remoteSupabaseTestUtils';

let currentServerClient: any;

const toastSuccess = jest.fn();
const toastError = jest.fn();
const remoteContext = new RemoteSupabaseTestContext('manager-task-verification');

jest.setTimeout(90000);

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => currentServerClient),
}));

jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

beforeEach(() => {
  // Reset toast assertions before each remote verification scenario.
  toastSuccess.mockReset();
  toastError.mockReset();
});

afterEach(async () => {
  // Remove all seeded task, notification, and user records after each test.
  await remoteContext.cleanup();
});

describe('When the manager loads remote tasks for review', () => {
  test('Then the task verification handlers return the seeded in-review task from the remote view', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: 'Verification Manager',
      emailPrefix: 'verification.manager',
    });
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Verification Employee',
      emailPrefix: 'verification.employee',
      employeeIdPrefix: 'VERIFY-EMP',
      points: 5,
      xp: 1,
      totalPointsEarned: 5,
    });
    const category = await remoteContext.seedCategory({
      namePrefix: 'Verification Category',
      points: 15,
      xp: 5,
    });
    const task = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'in review',
      pendingOrders: 1,
      completedOrders: 2,
      maxOrders: 5,
    });

    currentServerClient = remoteContext.createServerClientForUser(manager);

    const reviewTasks = await handleFetchTasksToReview();
    const paginatedTasks = await handleFetchTasksToReviewPaginated(
      1,
      employee.employeeId || '',
      'date-desc'
    );

    expect(reviewTasks.some((row) => row.kpitask_id === task.id)).toBe(true);
    expect(paginatedTasks.data.some((row) => row.kpitask_id === task.id)).toBe(true);
  });
});

describe('When the manager approves a remote task submission', () => {
  test('Then the task verification handlers update the remote task, clear pending orders, and create a notification', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: 'Approval Manager',
      emailPrefix: 'approval.manager',
    });
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Approval Employee',
      emailPrefix: 'approval.employee',
      employeeIdPrefix: 'APPROVE-EMP',
      points: 2,
      xp: 1,
      totalPointsEarned: 2,
    });
    const category = await remoteContext.seedCategory({
      namePrefix: 'Approval Category',
      points: 20,
      xp: 8,
    });
    const task = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'in review',
      pendingOrders: 2,
      completedOrders: 1,
      maxOrders: 5,
    });

    currentServerClient = remoteContext.createServerClientForUser(manager);

    const approvedTask = await handleApproveTask(task.id, approvalRemarkMockData);
    const { data: taskRow, error: taskReloadError } = await remoteContext.admin
      .from('KPITask')
      .select('status, pending_orders, completed_orders, remark')
      .eq('id', task.id)
      .single();
    const { data: notifications, error: notificationError } = await remoteContext.admin
      .from('Notification')
      .select('id, message')
      .eq('user_id', employee.id)
      .eq('type', 'task');
    const approvedTasks = await handleFetchApprovedTasksPaginated(
      1,
      employee.employeeId || '',
      'date-desc'
    );

    notifications?.forEach((row) => remoteContext.trackNotificationId(row.id));

    expect(approvedTask?.status).toBe('approved');
    expect(taskReloadError).toBeNull();
    expect(taskRow?.status).toBe('approved');
    expect(taskRow?.pending_orders).toBe(0);
    expect(taskRow?.completed_orders).toBe(3);
    expect(taskRow?.remark).toBe(approvalRemarkMockData);
    expect(notificationError).toBeNull();
    expect(notifications?.some((row) => row.message.includes('approved'))).toBe(true);
    expect(approvedTasks.data.some((row) => row.kpitask_id === task.id)).toBe(true);
  });
});

describe('When the manager rejects a remote task submission', () => {
  test('Then the task verification handlers update the remote task as rejected and create a rejection notification', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: 'Rejection Manager',
      emailPrefix: 'rejection.manager',
    });
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Rejection Employee',
      emailPrefix: 'rejection.employee',
      employeeIdPrefix: 'REJECT-EMP',
      points: 3,
      xp: 1,
      totalPointsEarned: 3,
    });
    const category = await remoteContext.seedCategory({
      namePrefix: 'Rejection Category',
      points: 12,
      xp: 4,
    });
    const task = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'in review',
      pendingOrders: 1,
      completedOrders: 0,
      maxOrders: 3,
    });

    currentServerClient = remoteContext.createServerClientForUser(manager);

    const rejectedTask = await handleRejectTask(task.id, rejectionRemarkMockData);
    const { data: taskRow, error: taskReloadError } = await remoteContext.admin
      .from('KPITask')
      .select('status, pending_orders, remark')
      .eq('id', task.id)
      .single();
    const { data: notifications, error: notificationError } = await remoteContext.admin
      .from('Notification')
      .select('id, message')
      .eq('user_id', employee.id)
      .eq('type', 'task');
    const deniedTasks = await handleFetchDeniedTasksPaginated(
      1,
      employee.employeeId || '',
      'date-desc'
    );

    notifications?.forEach((row) => remoteContext.trackNotificationId(row.id));

    expect(rejectedTask?.status).toBe('rejected');
    expect(taskReloadError).toBeNull();
    expect(taskRow?.status).toBe('rejected');
    expect(taskRow?.pending_orders).toBe(0);
    expect(taskRow?.remark).toBe(rejectionRemarkMockData);
    expect(notificationError).toBeNull();
    expect(notifications?.some((row) => row.message.includes('rejected'))).toBe(true);
    expect(deniedTasks.data.some((row) => row.kpitask_id === task.id)).toBe(true);
  });
});
