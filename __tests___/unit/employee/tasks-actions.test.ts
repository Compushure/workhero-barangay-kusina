/**
 * Test coverage:
 * - Employee task server actions (fetch, submit, redo, claim, perform-more, serve)
 * - Happy-path lifecycle transitions and persistence writes
 * - Edge cases: overdue gating, no claimable orders, ownership mismatch, idempotent serve
 * Run this file only: npm test -- --runTestsByPath __tests___/unit/employee/tasks-actions.test.ts
 */

import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  claimTaskPointsAndXP,
  fetchEmployeeTasks,
  performMoreOrders,
  redoTask,
  serveCookedTaskDish,
  submitTaskVerification,
} from '@/actions/employee/tasks';

type QueryError = { message: string } | null;

type MockUser = {
  id: string;
  email?: string;
};

let currentServerClient: unknown;
let currentAdminClient: unknown;

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => currentServerClient),
}));

jest.mock('@/lib/supabase/admin', () => ({
  get supabaseAdmin() {
    return currentAdminClient;
  },
}));

jest.mock('@/lib/notifications', () => ({
  insertNotification: jest.fn(async () => undefined),
}));

const { insertNotification } = jest.requireMock('@/lib/notifications') as {
  insertNotification: jest.MockedFunction<(input: unknown) => Promise<void>>;
};

function createAuthResponse(user: MockUser | null, error: QueryError = null) {
  return {
    data: { user },
    error,
  };
}

function createSingleSelectChain(row: unknown, error: QueryError = null) {
  return {
    eq: jest.fn(() => ({
      single: jest.fn(async () => ({ data: row, error })),
    })),
  };
}

function createListSelectChain(rows: unknown, error: QueryError = null) {
  return {
    eq: jest.fn(async () => ({ data: rows, error })),
  };
}

function createNotificationSelectChain(rows: unknown, error: QueryError = null) {
  return {
    eq: jest.fn(() => ({
      order: jest.fn(() => ({
        limit: jest.fn(async () => ({ data: rows, error })),
      })),
    })),
  };
}

function createDoubleEqUpdateChain(error: QueryError = null) {
  return {
    eq: jest.fn(() => ({
      eq: jest.fn(async () => ({ error })),
    })),
  };
}

function createSingleEqUpdateChain(error: QueryError = null) {
  return {
    eq: jest.fn(async () => ({ error })),
  };
}

beforeEach(() => {
  insertNotification.mockClear();
});

describe('When fetching employee tasks from the server action', () => {
  test('Then fetchEmployeeTasks groups statuses and hydrates cook metadata for claim-ready approved tasks', async () => {
    const taskRows = [
      {
        kpitask_id: 'task-assigned',
        status: 'assigned',
        points_claimed_at: null,
        kpitask_completed_at: null,
        category_name: 'Assigned Task',
        category_description: 'Assigned Task',
        category_points: 10,
        category_xp: 3,
        k_deadline_date: '2099-12-31',
        kpitask_created_at: '2026-04-10T00:00:00.000Z',
        remark: null,
        completed_orders: 0,
        pending_orders: 0,
        max_orders: 3,
      },
      {
        kpitask_id: 'task-ready-cook',
        status: 'approved',
        points_claimed_at: '2026-04-12T00:00:00.000Z',
        kpitask_completed_at: null,
        category_name: 'Approved Task',
        category_description: 'Approved Task',
        category_points: 20,
        category_xp: 7,
        k_deadline_date: '2099-12-31',
        kpitask_created_at: '2026-04-11T00:00:00.000Z',
        remark: null,
        completed_orders: 2,
        pending_orders: 0,
        max_orders: 2,
      },
      {
        kpitask_id: 'task-review',
        status: 'in review',
        points_claimed_at: null,
        kpitask_completed_at: null,
        category_name: 'Review Task',
        category_description: 'Review Task',
        category_points: 8,
        category_xp: 2,
        k_deadline_date: '2099-12-31',
        kpitask_created_at: '2026-04-09T00:00:00.000Z',
        remark: null,
        completed_orders: 1,
        pending_orders: 1,
        max_orders: 3,
      },
      {
        kpitask_id: 'task-rejected',
        status: 'rejected',
        points_claimed_at: null,
        kpitask_completed_at: null,
        category_name: 'Rejected Task',
        category_description: 'Rejected Task',
        category_points: 6,
        category_xp: 2,
        k_deadline_date: '2099-12-31',
        kpitask_created_at: '2026-04-08T00:00:00.000Z',
        remark: 'Redo needed',
        completed_orders: 0,
        pending_orders: 0,
        max_orders: 2,
      },
    ];

    const notificationRows = [
      {
        metadata: {
          taskId: 'task-ready-cook',
          cookReady: true,
          cookDish: {
            name: 'Sinigang',
            imageUrl: '/assets/dish/food-sinigang.png',
          },
          cookOrderCount: 2,
        },
        created_at: '2026-04-12T10:00:00.000Z',
      },
    ];

    currentServerClient = {
      auth: {
        getUser: jest.fn(async () => createAuthResponse({ id: 'employee-1', email: 'emp@test.com' })),
      },
      from: jest.fn((table: string) => {
        if (table === 'task_info_view') {
          return {
            select: jest.fn(() => createListSelectChain(taskRows)),
          };
        }

        if (table === 'Notification') {
          return {
            select: jest.fn(() => createNotificationSelectChain(notificationRows)),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    const result = await fetchEmployeeTasks();

    expect(result.error).toBeNull();
    expect(result.data?.currentTasks).toHaveLength(1);
    expect(result.data?.onReviewTasks).toHaveLength(1);
    expect(result.data?.verifiedTasks).toHaveLength(1);
    expect(result.data?.deniedTasks).toHaveLength(1);
    expect(result.data?.verifiedTasks[0]).toEqual(
      expect.objectContaining({
        id: 'task-ready-cook',
        cookDishName: 'Sinigang',
        cookDishImageUrl: '/assets/dish/food-sinigang.png',
        cookOrderCount: 2,
      })
    );
  });
});

describe('When submitTaskVerification executes', () => {
  test('Then submitTaskVerification moves an assigned task into review and records pending orders', async () => {
    currentServerClient = {
      auth: {
        getUser: jest.fn(async () => createAuthResponse({ id: 'employee-1', email: 'emp@test.com' })),
      },
      from: jest.fn((table: string) => {
        if (table === 'task_info_view') {
          return {
            select: jest.fn(() =>
              createSingleSelectChain({
                assigned_to: 'employee-1',
                status: 'assigned',
                completed_orders: 1,
                pending_orders: 0,
                max_orders: 4,
                points_claimed_at: null,
                category_name: 'Submit Task',
                k_deadline_date: '2099-12-31',
              })
            ),
          };
        }

        if (table === 'KPITask') {
          return {
            update: jest.fn(() => createDoubleEqUpdateChain()),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    currentAdminClient = { from: jest.fn() };

    const result = await submitTaskVerification('task-submit', 2);

    expect(result.error).toBeNull();
    expect(result.data).toEqual({
      success: true,
      pendingOrdersSubmitted: 2,
    });
    expect(insertNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'employee-1',
        type: 'task',
      })
    );
  });

  test('Then submitTaskVerification blocks edge input when pending orders exceed remaining capacity', async () => {
    currentServerClient = {
      auth: {
        getUser: jest.fn(async () => createAuthResponse({ id: 'employee-1', email: 'emp@test.com' })),
      },
      from: jest.fn((table: string) => {
        if (table === 'task_info_view') {
          return {
            select: jest.fn(() =>
              createSingleSelectChain({
                assigned_to: 'employee-1',
                status: 'assigned',
                completed_orders: 2,
                pending_orders: 0,
                max_orders: 3,
                points_claimed_at: null,
                category_name: 'Edge Submit Task',
                k_deadline_date: '2099-12-31',
              })
            ),
          };
        }

        if (table === 'KPITask') {
          return {
            update: jest.fn(() => createDoubleEqUpdateChain()),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    const result = await submitTaskVerification('task-submit-edge', 2);

    expect(result.error).toContain('Cannot submit 2 orders. Only 1 orders remaining');
    expect(insertNotification).not.toHaveBeenCalled();
  });
});

describe('When redoTask and performMoreOrders execute', () => {
  test('Then redoTask blocks overdue rejected tasks as an edge guard', async () => {
    currentServerClient = {
      auth: {
        getUser: jest.fn(async () => createAuthResponse({ id: 'employee-1', email: 'emp@test.com' })),
      },
      from: jest.fn((table: string) => {
        if (table === 'task_info_view') {
          return {
            select: jest.fn(() =>
              createSingleSelectChain({
                assigned_to: 'employee-1',
                status: 'rejected',
                k_deadline_date: '2000-01-01',
              })
            ),
          };
        }

        if (table === 'KPITask') {
          return {
            update: jest.fn(() => createDoubleEqUpdateChain()),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    const result = await redoTask('task-rejected-overdue');

    expect(result.error).toBe('unable to redo overdue tasks');
    expect(insertNotification).not.toHaveBeenCalled();
  });

  test('Then performMoreOrders moves approved claimed task back to assigned when orders remain', async () => {
    currentServerClient = {
      auth: {
        getUser: jest.fn(async () => createAuthResponse({ id: 'employee-1', email: 'emp@test.com' })),
      },
      from: jest.fn((table: string) => {
        if (table === 'task_info_view') {
          return {
            select: jest.fn(() =>
              createSingleSelectChain({
                assigned_to: 'employee-1',
                status: 'approved',
                points_claimed_at: '2026-04-12T10:00:00.000Z',
                completed_orders: 1,
                pending_orders: 0,
                max_orders: 3,
                category_name: 'Continue Task',
                k_deadline_date: '2099-12-31',
              })
            ),
          };
        }

        if (table === 'KPITask') {
          return {
            update: jest.fn(() => createDoubleEqUpdateChain()),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    const result = await performMoreOrders('task-more-orders');

    expect(result.error).toBeNull();
    expect(result.data).toBe(true);
    expect(insertNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('continue cooking'),
      })
    );
  });
});

describe('When claimTaskPointsAndXP executes', () => {
  test('Then claimTaskPointsAndXP adds points and XP on the happy path', async () => {
    const userUpdateCalls: Array<Record<string, unknown>> = [];
    const kpiUpdateCalls: Array<Record<string, unknown>> = [];

    currentServerClient = {
      auth: {
        getUser: jest.fn(async () => createAuthResponse({ id: 'employee-1', email: 'emp@test.com' })),
      },
      from: jest.fn((table: string) => {
        if (table === 'task_info_view') {
          return {
            select: jest.fn(() =>
              createSingleSelectChain({
                assigned_to: 'employee-1',
                status: 'approved',
                points_claimed_at: null,
                category_points: 12,
                category_xp: 5,
                completed_orders: 1,
                pending_orders: 1,
                max_orders: 3,
                category_name: 'Claim Task',
              })
            ),
          };
        }

        if (table === 'User') {
          return {
            select: jest.fn(() =>
              createSingleSelectChain({
                xp: 10,
                level: 1,
                total_xp: 10,
              })
            ),
          };
        }

        if (table === 'Level') {
          return {
            select: jest.fn(() => ({
              order: jest.fn(async () => ({
                data: [
                  { level: 1, xp: 0 },
                  { level: 2, xp: 100 },
                  { level: 3, xp: 200 },
                ],
                error: null,
              })),
            })),
          };
        }

        if (table === 'Dishes') {
          return {
            select: jest.fn(() => ({
              lte: jest.fn(async () => ({ data: [], error: null })),
            })),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    currentAdminClient = {
      from: jest.fn((table: string) => {
        if (table === 'User') {
          return {
            select: jest.fn(() =>
              createSingleSelectChain({
                points: 20,
                total_points_earned: 45,
              })
            ),
            update: jest.fn((payload: Record<string, unknown>) => {
              userUpdateCalls.push(payload);
              return createSingleEqUpdateChain();
            }),
          };
        }

        if (table === 'KPITask') {
          return {
            update: jest.fn((payload: Record<string, unknown>) => {
              kpiUpdateCalls.push(payload);
              return createSingleEqUpdateChain();
            }),
          };
        }

        throw new Error(`Unexpected admin table ${table}`);
      }),
    };

    const result = await claimTaskPointsAndXP('task-claim');

    expect(result.error).toBeNull();
    expect(result.data).toEqual(
      expect.objectContaining({
        pointsAdded: 12,
        xpAdded: 5,
        cookOutcome: expect.objectContaining({
          canPrepareFood: false,
          maxOrders: 3,
        }),
      })
    );

    expect(userUpdateCalls[0]).toEqual(
      expect.objectContaining({
        points: 32,
        total_points_earned: 57,
      })
    );
    expect(userUpdateCalls[1]).toEqual(
      expect.objectContaining({
        level: 1,
        xp: 15,
      })
    );
    expect(kpiUpdateCalls[0]).toEqual(
      expect.objectContaining({
        status: 'approved',
        pending_orders: 0,
      })
    );
    expect(insertNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'user',
      })
    );
  });

  test('Then claimTaskPointsAndXP rejects edge tasks that have no claimable completed orders', async () => {
    currentServerClient = {
      auth: {
        getUser: jest.fn(async () => createAuthResponse({ id: 'employee-1', email: 'emp@test.com' })),
      },
      from: jest.fn((table: string) => {
        if (table === 'task_info_view') {
          return {
            select: jest.fn(() =>
              createSingleSelectChain({
                assigned_to: 'employee-1',
                status: 'approved',
                points_claimed_at: null,
                category_points: 12,
                category_xp: 5,
                completed_orders: 0,
                pending_orders: 0,
                max_orders: 3,
                category_name: 'No Claimable Task',
              })
            ),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    currentAdminClient = {
      from: jest.fn(),
    };

    const result = await claimTaskPointsAndXP('task-no-claim');

    expect(result.error).toBe('No completed orders available to claim');
    expect(insertNotification).not.toHaveBeenCalled();
  });
});

describe('When serving cooked tasks', () => {
  test('Then serveCookedTaskDish blocks ownership mismatch as an edge guard', async () => {
    currentServerClient = {
      auth: {
        getUser: jest.fn(async () => createAuthResponse({ id: 'employee-2', email: 'emp2@test.com' })),
      },
      from: jest.fn((table: string) => {
        if (table === 'task_info_view') {
          return {
            select: jest.fn(() =>
              createSingleSelectChain({
                assigned_to: 'employee-1',
                status: 'approved',
                points_claimed_at: '2026-04-12T12:00:00.000Z',
                completed_orders: 3,
                max_orders: 3,
                kpitask_completed_at: null,
              })
            ),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    currentAdminClient = { from: jest.fn() };

    const result = await serveCookedTaskDish('task-serve-ownership');

    expect(result.error).toBe('You can only serve dishes for your own task');
    expect(result.data).toBeUndefined();
  });

  test('Then serveCookedTaskDish is idempotent when the task was already marked served', async () => {
    const adminFromSpy = jest.fn();

    currentServerClient = {
      auth: {
        getUser: jest.fn(async () => createAuthResponse({ id: 'employee-1', email: 'emp@test.com' })),
      },
      from: jest.fn((table: string) => {
        if (table === 'task_info_view') {
          return {
            select: jest.fn(() =>
              createSingleSelectChain({
                assigned_to: 'employee-1',
                status: 'approved',
                points_claimed_at: '2026-04-12T12:00:00.000Z',
                completed_orders: 3,
                max_orders: 3,
                kpitask_completed_at: '2026-04-12T14:00:00.000Z',
              })
            ),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    currentAdminClient = { from: adminFromSpy };

    const result = await serveCookedTaskDish('task-serve-idempotent');

    expect(result.error).toBeNull();
    expect(result.data).toBe(true);
    expect(adminFromSpy).not.toHaveBeenCalled();
  });
});
