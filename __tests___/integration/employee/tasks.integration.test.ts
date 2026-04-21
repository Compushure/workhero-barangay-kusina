/**
 * WARNING: run against the dedicated test database only.
 * Test coverage:
 * - Remote employee task lifecycle happy paths (fetch, submit, redo, claim, perform-more, serve)
 * - Remote edge cases (overdue submit, no claimable orders, ownership mismatch)
 * - Env preflight guard for required .env.test Supabase keys
 * Run this file only: npm test -- --runTestsByPath __tests___/integration/employee/tasks.integration.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  handleClaimTaskPointsAndXP,
  handleFetchEmployeeTasks,
  handlePerformMoreOrders,
  handleRedoTask,
  handleServeCookedTaskDish,
  handleSubmitTaskVerification,
} from '@/action-handlers/employee/tasks';
import { RemoteSupabaseTestContext } from '../../utils/remoteSupabaseTestUtils';
import { assertRemoteTestDbEnv } from '../../utils/testDbEnvGuard';

assertRemoteTestDbEnv();

let currentServerClient: ReturnType<RemoteSupabaseTestContext['createServerClientForUser']>;
const remoteContext = new RemoteSupabaseTestContext('employee-tasks');

const toastError = jest.fn();

jest.setTimeout(120000);

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => currentServerClient),
}));

jest.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

beforeEach(() => {
  toastError.mockReset();
});

afterEach(async () => {
  await remoteContext.cleanup();
});

describe('When employee task handlers run against the remote test database', () => {
  test('Then handleFetchEmployeeTasks groups seeded tasks by status and hydrates cook-ready metadata', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: 'Employee Tasks Fetch Manager',
      emailPrefix: 'employee.tasks.fetch.manager',
    });
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Employee Tasks Fetch Employee',
      emailPrefix: 'employee.tasks.fetch.employee',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const category = await remoteContext.seedCategory({
      namePrefix: 'Employee Tasks Fetch Category',
      points: 10,
      xp: 4,
    });

    await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'assigned',
      pendingOrders: 0,
      completedOrders: 1,
      maxOrders: 3,
      deadlineDate: '2099-12-31',
    });

    await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'in review',
      pendingOrders: 1,
      completedOrders: 1,
      maxOrders: 3,
      deadlineDate: '2099-12-31',
    });

    const approvedClaimReady = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'approved',
      pendingOrders: 0,
      completedOrders: 2,
      maxOrders: 2,
      deadlineDate: '2099-12-31',
    });

    await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'rejected',
      pendingOrders: 0,
      completedOrders: 0,
      maxOrders: 2,
      deadlineDate: '2099-12-31',
    });

    await remoteContext.admin
      .from('KPITask')
      .update({ points_claimed_at: '2026-04-12T09:00:00.000Z' })
      .eq('id', approvedClaimReady.id);

    await remoteContext.seedNotification({
      userId: employee.id,
      type: 'task',
      message: 'Dish ready for cooking',
      metadata: {
        taskId: approvedClaimReady.id,
        cookReady: true,
        cookDish: {
          name: 'Sinigang',
          imageUrl: '/assets/dish/food-sinigang.png',
        },
        cookOrderCount: 2,
      },
    });

    currentServerClient = remoteContext.createServerClientForUser(employee);

    const result = await handleFetchEmployeeTasks();

    expect(result).not.toBeNull();
    expect(result?.currentTasks).toHaveLength(1);
    expect(result?.onReviewTasks).toHaveLength(1);
    expect(result?.verifiedTasks).toHaveLength(1);
    expect(result?.deniedTasks).toHaveLength(1);

    const verifiedTask = result?.verifiedTasks.find((task) => task.id === approvedClaimReady.id);
    expect(verifiedTask).toEqual(
      expect.objectContaining({
        cookDishName: 'Sinigang',
        cookDishImageUrl: '/assets/dish/food-sinigang.png',
        cookOrderCount: 2,
      })
    );
    expect(toastError).not.toHaveBeenCalled();
  });

  test('Then handleSubmitTaskVerification transitions assigned task to in-review with pending orders', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: 'Employee Tasks Submit Manager',
      emailPrefix: 'employee.tasks.submit.manager',
    });
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Employee Tasks Submit Employee',
      emailPrefix: 'employee.tasks.submit.employee',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const category = await remoteContext.seedCategory({
      namePrefix: 'Employee Tasks Submit Category',
      points: 9,
      xp: 4,
    });

    const task = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'assigned',
      pendingOrders: 0,
      completedOrders: 1,
      maxOrders: 4,
      deadlineDate: '2099-12-31',
    });

    currentServerClient = remoteContext.createServerClientForUser(employee);

    const result = await handleSubmitTaskVerification(task.id, 2);
    const { data: updatedTask, error } = await remoteContext.admin
      .from('KPITask')
      .select('status, pending_orders, verification_requested_at')
      .eq('id', task.id)
      .single();

    expect(result).toEqual({ success: true, pendingOrdersSubmitted: 2 });
    expect(error).toBeNull();
    expect(updatedTask).toEqual(
      expect.objectContaining({
        status: 'in review',
        pending_orders: 2,
      })
    );
    expect(updatedTask?.verification_requested_at).toEqual(expect.any(String));
  });

  test('Then handleRedoTask transitions a rejected task back to assigned status', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: 'Employee Tasks Redo Manager',
      emailPrefix: 'employee.tasks.redo.manager',
    });
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Employee Tasks Redo Employee',
      emailPrefix: 'employee.tasks.redo.employee',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const category = await remoteContext.seedCategory({
      namePrefix: 'Employee Tasks Redo Category',
      points: 8,
      xp: 3,
    });

    const task = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'rejected',
      pendingOrders: 0,
      completedOrders: 0,
      maxOrders: 2,
      deadlineDate: '2099-12-31',
    });

    currentServerClient = remoteContext.createServerClientForUser(employee);

    const result = await handleRedoTask(task.id);
    const { data: updatedTask, error } = await remoteContext.admin
      .from('KPITask')
      .select('status, pending_orders')
      .eq('id', task.id)
      .single();

    expect(result).toBe(true);
    expect(error).toBeNull();
    expect(updatedTask).toEqual(
      expect.objectContaining({
        status: 'assigned',
      })
    );
  });

  test('Then handleClaimTaskPointsAndXP grants points and XP and marks claim metadata', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: 'Employee Tasks Claim Manager',
      emailPrefix: 'employee.tasks.claim.manager',
    });
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Employee Tasks Claim Employee',
      emailPrefix: 'employee.tasks.claim.employee',
      points: 5,
      xp: 0,
      level: 1,
      totalPointsEarned: 5,
    });
    const category = await remoteContext.seedCategory({
      namePrefix: 'Employee Tasks Claim Category',
      points: 12,
      xp: 5,
    });

    const task = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'approved',
      pendingOrders: 1,
      completedOrders: 1,
      maxOrders: 3,
      deadlineDate: '2099-12-31',
    });

    currentServerClient = remoteContext.createServerClientForUser(employee);

    const result = await handleClaimTaskPointsAndXP(task.id, 'Claim Category', 1, 1, 3);
    const { data: userRow, error: userError } = await remoteContext.admin
      .from('User')
      .select('points, xp, level, total_points_earned, total_xp')
      .eq('id', employee.id)
      .single();
    const { data: taskRow, error: taskError } = await remoteContext.admin
      .from('KPITask')
      .select('status, pending_orders, points_claimed_at')
      .eq('id', task.id)
      .single();

    expect(result?.pointsAdded).toBe(12);
    expect(result?.xpAdded).toBe(5);
    expect(userError).toBeNull();
    expect(taskError).toBeNull();
    expect(userRow?.points).toBe(17);
    expect(userRow?.total_points_earned).toBe(17);
    expect(userRow?.xp).toBeGreaterThanOrEqual(5);
    expect(userRow?.level).toBeGreaterThanOrEqual(1);
    expect(userRow?.total_xp).toBeGreaterThanOrEqual(5);
    expect(taskRow).toEqual(
      expect.objectContaining({
        status: 'approved',
        pending_orders: 0,
      })
    );
    expect(taskRow?.points_claimed_at).toEqual(expect.any(String));
    expect(toastError).not.toHaveBeenCalled();
  });

  test('Then handlePerformMoreOrders moves approved claimed tasks with remaining orders back to assigned', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: 'Employee Tasks Perform Manager',
      emailPrefix: 'employee.tasks.perform.manager',
    });
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Employee Tasks Perform Employee',
      emailPrefix: 'employee.tasks.perform.employee',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const category = await remoteContext.seedCategory({
      namePrefix: 'Employee Tasks Perform Category',
      points: 10,
      xp: 4,
    });

    const task = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'approved',
      pendingOrders: 0,
      completedOrders: 1,
      maxOrders: 3,
      deadlineDate: '2099-12-31',
    });

    await remoteContext.admin
      .from('KPITask')
      .update({ points_claimed_at: '2026-04-12T09:00:00.000Z' })
      .eq('id', task.id);

    currentServerClient = remoteContext.createServerClientForUser(employee);

    const result = await handlePerformMoreOrders(task.id);
    const { data: updatedTask, error } = await remoteContext.admin
      .from('KPITask')
      .select('status, pending_orders')
      .eq('id', task.id)
      .single();

    expect(result).toBe(true);
    expect(error).toBeNull();
    expect(updatedTask).toEqual(
      expect.objectContaining({
        status: 'assigned',
        pending_orders: 0,
      })
    );
  });

  test('Then handleServeCookedTaskDish marks fully completed claimed task as served', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: 'Employee Tasks Serve Manager',
      emailPrefix: 'employee.tasks.serve.manager',
    });
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Employee Tasks Serve Employee',
      emailPrefix: 'employee.tasks.serve.employee',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const category = await remoteContext.seedCategory({
      namePrefix: 'Employee Tasks Serve Category',
      points: 9,
      xp: 3,
    });

    const task = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'approved',
      pendingOrders: 0,
      completedOrders: 2,
      maxOrders: 2,
      deadlineDate: '2099-12-31',
    });

    await remoteContext.admin
      .from('KPITask')
      .update({ points_claimed_at: '2026-04-12T09:00:00.000Z' })
      .eq('id', task.id);

    currentServerClient = remoteContext.createServerClientForUser(employee);

    const result = await handleServeCookedTaskDish(task.id);
    const { data: updatedTask, error } = await remoteContext.admin
      .from('KPITask')
      .select('completed_at')
      .eq('id', task.id)
      .single();

    expect(result).toBe(true);
    expect(error).toBeNull();
    expect(updatedTask?.completed_at).toEqual(expect.any(String));
  });
});

describe('When remote employee task handlers hit edge cases', () => {
  test('Then handleSubmitTaskVerification returns null for overdue task submissions', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: 'Employee Tasks Overdue Submit Manager',
      emailPrefix: 'employee.tasks.overdue.submit.manager',
    });
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Employee Tasks Overdue Submit Employee',
      emailPrefix: 'employee.tasks.overdue.submit.employee',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const category = await remoteContext.seedCategory({
      namePrefix: 'Employee Tasks Overdue Submit Category',
      points: 9,
      xp: 3,
    });

    const task = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'assigned',
      pendingOrders: 0,
      completedOrders: 0,
      maxOrders: 2,
      deadlineDate: '2000-01-01',
    });

    currentServerClient = remoteContext.createServerClientForUser(employee);

    const result = await handleSubmitTaskVerification(task.id, 1);

    expect(result).toBeNull();
    expect(toastError).toHaveBeenCalledWith('unable to submit overdue tasks');
  });

  test('Then handleClaimTaskPointsAndXP returns null when there are no claimable completed orders', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: 'Employee Tasks No Claim Manager',
      emailPrefix: 'employee.tasks.no.claim.manager',
    });
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Employee Tasks No Claim Employee',
      emailPrefix: 'employee.tasks.no.claim.employee',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const category = await remoteContext.seedCategory({
      namePrefix: 'Employee Tasks No Claim Category',
      points: 12,
      xp: 5,
    });

    const task = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: employee.id,
      categoryId: category.id,
      status: 'approved',
      pendingOrders: 0,
      completedOrders: 0,
      maxOrders: 3,
      deadlineDate: '2099-12-31',
    });

    currentServerClient = remoteContext.createServerClientForUser(employee);

    const result = await handleClaimTaskPointsAndXP(task.id, 'No Claim Task', 0, 0, 3);

    expect(result).toBeNull();
    expect(toastError).toHaveBeenCalledWith('No completed orders available to claim');
  });

  test('Then handleServeCookedTaskDish rejects ownership mismatch for another user', async () => {
    const manager = await remoteContext.seedUser({
      roleType: 'manager',
      namePrefix: 'Employee Tasks Ownership Manager',
      emailPrefix: 'employee.tasks.ownership.manager',
    });
    const ownerEmployee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Employee Tasks Owner Employee',
      emailPrefix: 'employee.tasks.owner.employee',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const anotherEmployee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Employee Tasks Another Employee',
      emailPrefix: 'employee.tasks.another.employee',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const category = await remoteContext.seedCategory({
      namePrefix: 'Employee Tasks Ownership Category',
      points: 10,
      xp: 3,
    });

    const task = await remoteContext.seedTask({
      assignedBy: manager.id,
      assignedTo: ownerEmployee.id,
      categoryId: category.id,
      status: 'approved',
      pendingOrders: 0,
      completedOrders: 2,
      maxOrders: 2,
      deadlineDate: '2099-12-31',
    });

    await remoteContext.admin
      .from('KPITask')
      .update({ points_claimed_at: '2026-04-12T09:00:00.000Z' })
      .eq('id', task.id);

    currentServerClient = remoteContext.createServerClientForUser(anotherEmployee);

    const result = await handleServeCookedTaskDish(task.id);

    expect(result).toBeNull();
    expect(toastError).toHaveBeenCalledWith('You can only serve dishes for your own task');
  });
});
