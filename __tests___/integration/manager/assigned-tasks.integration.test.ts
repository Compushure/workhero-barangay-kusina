/**
 *  WARNING: MAKE SURE YOU HAVE THE RIGHT ENV FOR THE TEST DB DIOS MIOKO
 * Test coverage:
 * - Fetch remote assigned tasks (task view)
 * - Fetch remote assigned tasks (employee view)
 * - Clear unstarted tasks for a specific employee
 * - Delete a specific assigned task
 * Run this file only: npm test -- --runTestsByPath __tests___/integration/manager/assigned-tasks.integration.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import {
  handleClearUnstartedEmployeeTasks,
  handleDeleteTask,
  handleFetchCurrentAssignedEmployeesPaginated,
  handleFetchCurrentAssignedTasksPaginated,
} from '@/action-handlers/manager/assigned-tasks';
import { RemoteSupabaseTestContext } from '../../utils/remoteSupabaseTestUtils';
import { managerAssignedTasksIntegrationNames } from '../../mockData/managerAssignedTasksMockData';

type ServerClient = ReturnType<RemoteSupabaseTestContext['createServerClientForUser']>;
let currentServerClient: ServerClient;

const toastSuccess = jest.fn();
const toastError = jest.fn();
const toastInfo = jest.fn();
const remoteContext = new RemoteSupabaseTestContext('manager-assigned-tasks');

jest.setTimeout(90000);

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => currentServerClient),
}));

jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
    info: (...args: unknown[]) => toastInfo(...args),
  },
}));

beforeEach(() => {
  toastSuccess.mockReset();
  toastError.mockReset();
  toastInfo.mockReset();
});

afterEach(async () => {
  await remoteContext.cleanup();
});

describe('When the manager loads remote assigned tasks', () => {
  test('Then assigned-task handlers return seeded task rows in both task and employee views', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: managerAssignedTasksIntegrationNames.load.managerNamePrefix,
      emailPrefix: managerAssignedTasksIntegrationNames.load.managerEmailPrefix,
    });
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: managerAssignedTasksIntegrationNames.load.employeeNamePrefix,
      emailPrefix: managerAssignedTasksIntegrationNames.load.employeeEmailPrefix,
      employeeIdPrefix: managerAssignedTasksIntegrationNames.load.employeeIdPrefix,
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const category = await remoteContext.seedCategory({
      namePrefix: managerAssignedTasksIntegrationNames.load.categoryNamePrefix,
      points: 20,
      xp: 7,
    });
    const seededTask = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'assigned',
      pendingOrders: 1,
      completedOrders: 0,
      maxOrders: 3,
      deadlineDate: '2099-12-31',
    });

    currentServerClient = remoteContext.createServerClientForUser(manager);

    const taskView = await handleFetchCurrentAssignedTasksPaginated(1, 10, 'recently added');
    const employeeView = await handleFetchCurrentAssignedEmployeesPaginated(
      1,
      10,
      'recently added'
    );

    expect(taskView.tasks.some((row) => row.id === seededTask.id)).toBe(true);
    expect(taskView.employeeCount).toBeGreaterThanOrEqual(1);
    expect(employeeView.tasks.some((row) => row.id === seededTask.id)).toBe(true);
    expect(employeeView.taskCount).toBeGreaterThanOrEqual(1);
    expect(toastError).not.toHaveBeenCalled();
  });
});

describe('When the manager clears unstarted tasks for a specific employee', () => {
  test('Then the clear handler removes seeded unstarted assigned tasks only for the target employee', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: managerAssignedTasksIntegrationNames.clear.managerNamePrefix,
      emailPrefix: managerAssignedTasksIntegrationNames.clear.managerEmailPrefix,
    });
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: managerAssignedTasksIntegrationNames.clear.employeeNamePrefix,
      emailPrefix: managerAssignedTasksIntegrationNames.clear.employeeEmailPrefix,
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const category = await remoteContext.seedCategory({
      namePrefix: managerAssignedTasksIntegrationNames.clear.categoryNamePrefix,
      points: 10,
      xp: 3,
    });
    const seededTask = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'assigned',
      pendingOrders: 0,
      completedOrders: 0,
      maxOrders: 2,
      deadlineDate: '2099-12-31',
    });

    currentServerClient = remoteContext.createServerClientForUser(manager);

    const cleared = await handleClearUnstartedEmployeeTasks(employee.id);
    const { data: deletedTaskRow, error: reloadError } = await remoteContext.admin
      .from('KPITask')
      .select('id')
      .eq('id', seededTask.id)
      .maybeSingle();

    expect(cleared).toBe(1);
    expect(reloadError).toBeNull();
    expect(deletedTaskRow).toBeNull();
    expect(toastSuccess).toHaveBeenCalledWith('Cleared 1 unstarted task');
  });

  test('Then the clear handler deletes only assigned rows with zero pending and completed orders', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: `${managerAssignedTasksIntegrationNames.clear.managerNamePrefix} Selective`,
      emailPrefix: `${managerAssignedTasksIntegrationNames.clear.managerEmailPrefix}.selective`,
    });
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: `${managerAssignedTasksIntegrationNames.clear.employeeNamePrefix} Selective`,
      emailPrefix: `${managerAssignedTasksIntegrationNames.clear.employeeEmailPrefix}.selective`,
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const category = await remoteContext.seedCategory({
      namePrefix: `${managerAssignedTasksIntegrationNames.clear.categoryNamePrefix} Selective`,
      points: 10,
      xp: 3,
    });

    const unstartedTask = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'assigned',
      pendingOrders: 0,
      completedOrders: 0,
      maxOrders: 2,
      deadlineDate: '2099-12-31',
    });
    const inProgressTask = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'assigned',
      pendingOrders: 1,
      completedOrders: 0,
      maxOrders: 2,
      deadlineDate: '2099-12-31',
    });
    const approvedTask = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'approved',
      pendingOrders: 0,
      completedOrders: 1,
      maxOrders: 2,
      deadlineDate: '2099-12-31',
    });

    currentServerClient = remoteContext.createServerClientForUser(manager);

    const cleared = await handleClearUnstartedEmployeeTasks(employee.id);
    const { data: remainingRows, error: reloadError } = await remoteContext.admin
      .from('KPITask')
      .select('id')
      .in('id', [unstartedTask.id, inProgressTask.id, approvedTask.id]);

    expect(cleared).toBe(1);
    expect(reloadError).toBeNull();
    const remainingIds = new Set((remainingRows ?? []).map((row) => row.id));
    expect(remainingIds.has(unstartedTask.id)).toBe(false);
    expect(remainingIds.has(inProgressTask.id)).toBe(true);
    expect(remainingIds.has(approvedTask.id)).toBe(true);
    expect(toastSuccess).toHaveBeenCalledWith('Cleared 1 unstarted task');
  });
});

describe('When the manager deletes a specific assigned task', () => {
  test('Then the delete handler removes the seeded assignment row', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: managerAssignedTasksIntegrationNames.delete.managerNamePrefix,
      emailPrefix: managerAssignedTasksIntegrationNames.delete.managerEmailPrefix,
    });
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: managerAssignedTasksIntegrationNames.delete.employeeNamePrefix,
      emailPrefix: managerAssignedTasksIntegrationNames.delete.employeeEmailPrefix,
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const category = await remoteContext.seedCategory({
      namePrefix: managerAssignedTasksIntegrationNames.delete.categoryNamePrefix,
      points: 12,
      xp: 4,
    });
    const seededTask = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'assigned',
      pendingOrders: 1,
      completedOrders: 0,
      maxOrders: 3,
      deadlineDate: '2099-12-31',
    });

    currentServerClient = remoteContext.createServerClientForUser(manager);

    const deleted = await handleDeleteTask(seededTask.id);
    const { data: deletedTaskRow, error: reloadError } = await remoteContext.admin
      .from('KPITask')
      .select('id')
      .eq('id', seededTask.id)
      .maybeSingle();

    expect(deleted).toBe(true);
    expect(reloadError).toBeNull();
    expect(deletedTaskRow).toBeNull();
    expect(toastSuccess).toHaveBeenCalledWith('Task deleted');
  });
});
