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
  handleClearUnstartedTaskAssignments,
  handleClearUnstartedEmployeeTasks,
  handleDeleteTask,
  handleFetchCurrentAssignedEmployeesPaginated,
  handleFetchCurrentAssignedTasksPaginated,
  handleUpdateTaskAssignment,
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

  test('Then seeded deadline values align to 11:59PM Asia/Manila and overdue filters classify correctly', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: 'Manager Deadline Window',
      emailPrefix: 'manager.deadline.window',
    });
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Employee Deadline Window',
      emailPrefix: 'employee.deadline.window',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const category = await remoteContext.seedCategory({
      namePrefix: 'Deadline Window Category',
      points: 8,
      xp: 3,
    });

    const futureTask = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'assigned',
      pendingOrders: 0,
      completedOrders: 0,
      maxOrders: 1,
      deadlineDate: '2099-12-31T15:59:59.999Z',
    });

    const overdueTask = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'assigned',
      pendingOrders: 0,
      completedOrders: 0,
      maxOrders: 1,
      deadlineDate: '2000-01-01T15:59:59.999Z',
    });

    currentServerClient = remoteContext.createServerClientForUser(manager);

    const { data: futureTaskRow, error: futureTaskError } = await remoteContext.admin
      .from('KPITask')
      .select('deadline_date')
      .eq('id', futureTask.id)
      .single();

    expect(futureTaskError).toBeNull();
    const normalizedFutureDeadline = new Date((futureTaskRow as { deadline_date: string }).deadline_date);
    expect(
      normalizedFutureDeadline.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })
    ).toBe('2099-12-31');
    expect(
      normalizedFutureDeadline.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    ).toBe('23:59:59');

    const nonOverdueView = await handleFetchCurrentAssignedTasksPaginated(
      1,
      20,
      'recently added',
      '',
      [],
      'hide-overdue'
    );
    expect(nonOverdueView.tasks.some((row) => row.id === futureTask.id)).toBe(true);
    expect(nonOverdueView.tasks.some((row) => row.id === overdueTask.id)).toBe(false);

    const overdueOnlyView = await handleFetchCurrentAssignedTasksPaginated(
      1,
      20,
      'recently added',
      '',
      [],
      'only-overdue'
    );
    expect(overdueOnlyView.tasks.some((row) => row.id === overdueTask.id)).toBe(true);
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
    expect(toastSuccess).toHaveBeenCalledWith('1 unstarted task was deleted');
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
    expect(toastSuccess).toHaveBeenCalledWith('1 unstarted task was deleted');
  });

  test('Then the clear-all handler removes only unstarted assigned rows across employees', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: `${managerAssignedTasksIntegrationNames.clear.managerNamePrefix} Global`,
      emailPrefix: `${managerAssignedTasksIntegrationNames.clear.managerEmailPrefix}.global`,
    });
    const employeeOne = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: `${managerAssignedTasksIntegrationNames.clear.employeeNamePrefix} Global One`,
      emailPrefix: `${managerAssignedTasksIntegrationNames.clear.employeeEmailPrefix}.global.one`,
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const employeeTwo = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: `${managerAssignedTasksIntegrationNames.clear.employeeNamePrefix} Global Two`,
      emailPrefix: `${managerAssignedTasksIntegrationNames.clear.employeeEmailPrefix}.global.two`,
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const category = await remoteContext.seedCategory({
      namePrefix: `${managerAssignedTasksIntegrationNames.clear.categoryNamePrefix} Global`,
      points: 11,
      xp: 3,
    });

    const removableTask = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employeeOne.id,
      categoryId: category.id,
      status: 'assigned',
      pendingOrders: 0,
      completedOrders: 0,
      maxOrders: 2,
      deadlineDate: '2099-12-31',
    });
    const retainedTask = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employeeTwo.id,
      categoryId: category.id,
      status: 'assigned',
      pendingOrders: 1,
      completedOrders: 0,
      maxOrders: 2,
      deadlineDate: '2099-12-31',
    });

    currentServerClient = remoteContext.createServerClientForUser(manager);

    const cleared = await handleClearUnstartedTaskAssignments();
    const { data: remainingRows, error: reloadError } = await remoteContext.admin
      .from('KPITask')
      .select('id')
      .in('id', [removableTask.id, retainedTask.id]);

    expect(cleared).toBe(1);
    expect(reloadError).toBeNull();
    const remainingIds = new Set((remainingRows ?? []).map((row) => row.id));
    expect(remainingIds.has(removableTask.id)).toBe(false);
    expect(remainingIds.has(retainedTask.id)).toBe(true);
    expect(toastSuccess).toHaveBeenCalledWith('1 unstarted task assignment was deleted');
  });
});

describe('When the manager edits an assigned task group', () => {
  test('Then the update handler updates max orders and due date, and adds newly selected employees', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: 'Update Assigned Manager',
      emailPrefix: 'update.assigned.manager',
    });
    const employeeOne = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Update Assigned Employee One',
      emailPrefix: 'update.assigned.employee.one',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const employeeTwo = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Update Assigned Employee Two',
      emailPrefix: 'update.assigned.employee.two',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const category = await remoteContext.seedCategory({
      namePrefix: 'Update Assigned Category',
      points: 13,
      xp: 4,
    });

    const seededTask = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employeeOne.id,
      categoryId: category.id,
      status: 'assigned',
      pendingOrders: 0,
      completedOrders: 0,
      maxOrders: 2,
      deadlineDate: '2099-12-31',
    });

    currentServerClient = remoteContext.createServerClientForUser(manager);

    const updated = await handleUpdateTaskAssignment(seededTask.id, 5, '2099-11-30', [
      employeeOne.id,
      employeeTwo.id,
    ]);

    const { data: rows, error: reloadError } = await remoteContext.admin
      .from('KPITask')
      .select('id, assigned_to, max_orders, deadline_date')
      .eq('category_id', category.id)
      .order('assigned_to', { ascending: true });

    expect(updated).toBe(true);
    expect(reloadError).toBeNull();
    expect(rows?.length).toBeGreaterThanOrEqual(2);
    const assignedIds = (rows ?? []).map((row) => row.assigned_to);
    expect(assignedIds).toEqual(expect.arrayContaining([employeeOne.id, employeeTwo.id]));
    (rows ?? []).forEach((row) => {
      expect(row.max_orders).toBe(5);
      expect(String(row.deadline_date)).toContain('2099-11-30');
    });

    // The update flow may insert new assignments not tracked by the test context helper.
    // Delete those rows here to avoid FK cleanup failures in afterEach.
    const updatedRowIds = (rows ?? []).map((row) => row.id);
    if (updatedRowIds.length > 0) {
      const { error: cleanupError } = await remoteContext.admin
        .from('KPITask')
        .delete()
        .in('id', updatedRowIds);

      expect(cleanupError).toBeNull();
    }

    expect(toastSuccess).toHaveBeenCalledWith('Task updated');
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
    expect(toastSuccess).toHaveBeenCalledWith('Employee unassigned from Task');
  });
});
