/**
 * Test coverage:
 * - Fetch manual badges
 * - Fetch badge assignment users
 * - Assign a manual badge to a user
 * - Fetch badge award debug entries
 * - Remove a badge award
 * - Fetch all badges for assignment workflows
 * - Verify the matching action handlers for badge assignment
 * Run this file only: npm test -- --runTestsByPath __tests___/unit/manager/badge-assignment.test.ts
 */

import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  automaticBadgeMockData,
  badgeAssignmentUserMockData,
  badgeAwardDebugEntryMockData,
  manualBadgeMockData,
} from '../../mockData/managerBadgeAssignmentMockData';
import {
  assignManualBadgeToUser,
  fetchAllBadges,
  fetchBadgeAssignmentUsers,
  fetchBadgeAwardDebugEntries,
  fetchManualBadges,
  removeBadgeAward,
} from '@/actions/manager/badge-assignment';
import {
  handleAssignManualBadgeToUser,
  handleFetchBadgeAssignmentUsers,
  handleFetchBadgeAwardDebugEntries,
  handleFetchManualBadges,
  handleRemoveBadgeAward,
} from '@/action-handlers/manager/badge-assignment';

type CreateClientFn = () => Promise<unknown>;
type GetUserRoleFn = () => Promise<{ role: string | null; error: string | null }>;
type InsertNotificationFn = typeof import('@/lib/notifications').insertNotification;
type ToastFn = (message?: unknown) => unknown;
type AdminBadgeRow = {
  id: string;
  name: string;
  description?: string | null;
  points?: number | null;
  img_link?: string | null;
  award_at_interval: string;
};
type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  employee_id: string | null;
  points: number;
  total_points_earned?: number;
};
type AdminAwardRow = {
  id: string;
  badge_id: string;
  awarded_to: string;
  awarded_by: string | null;
  date_acquired: string;
};

let adminState: {
  badges: AdminBadgeRow[];
  users: AdminUserRow[];
  awards: AdminAwardRow[];
  failManualBadges?: boolean;
  failUsers?: boolean;
  failCollected?: boolean;
  failAwardInsert?: boolean;
  duplicateAward?: boolean;
  failAwardDelete?: boolean;
  failAwardLookup?: boolean;
  failBadgeLookup?: boolean;
};

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/actions/shared/auth', () => ({
  getUserRole: jest.fn(async () => ({ role: 'manager', error: null })),
}));

jest.mock('@/lib/notifications', () => ({
  insertNotification: jest.fn(async () => undefined),
}));

jest.mock('@/lib/utils/safe-action', () => ({
  safeAction: jest.fn(async (fn: () => Promise<unknown>) => {
    try {
      const data = await fn();
      return { success: true, data, error: null };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unexpected error',
      };
    }
  }),
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

const { getUserRole } = jest.requireMock('@/actions/shared/auth') as {
  getUserRole: jest.MockedFunction<GetUserRoleFn>;
};
const getUserRoleMock = getUserRole;

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

jest.mock('@/lib/supabase/admin', () => ({
  get supabaseAdmin() {
    // Mirror the chained Supabase query builders used by the action.
    const createBadgeSelectBuilder = () => ({
      eq: (_field: string, value: string) => ({
        order: async () => ({
          data: adminState.failManualBadges
            ? null
            : adminState.badges.filter((badge) => badge.award_at_interval === value),
          error: adminState.failManualBadges ? { message: 'manual badge query failed' } : null,
        }),
        single: async () => {
          if (adminState.failBadgeLookup) {
            return { data: null, error: { message: 'badge lookup failed' } };
          }

          const badge = adminState.badges.find((row) => row.id === value) || null;
          return badge
            ? { data: badge, error: null }
            : { data: null, error: { message: 'Badge not found' } };
        },
      }),
      order: async () => ({
        data: [...adminState.badges],
        error: null,
      }),
      in: async (_field: string, ids: string[]) => ({
        data: adminState.badges.filter((badge) => ids.includes(badge.id)),
        error: null,
      }),
    });

    return {
      storage: {
        from: jest.fn(() => ({
          getPublicUrl: (path: string) => ({
            data: { publicUrl: `https://cdn.example.com/${path}` },
          }),
        })),
      },
      from: jest.fn((table: string) => {
        if (table === 'Badges') {
          return {
            select: jest.fn(() => createBadgeSelectBuilder()),
          };
        }

        if (table === 'User') {
          return {
            select: jest.fn(() => ({
              order: async () => ({
                data: adminState.failUsers ? null : adminState.users,
                error: adminState.failUsers ? { message: 'user query failed' } : null,
              }),
              in: async (_field: string, ids: string[]) => ({
                data: adminState.users.filter((user) => ids.includes(user.id)),
                error: null,
              }),
              eq: (_field: string, id: string) => ({
                single: async () => {
                  const user = adminState.users.find((row) => row.id === id) || null;
                  return user
                    ? { data: user, error: null }
                    : { data: null, error: { message: 'User not found' } };
                },
              }),
            })),
            update: (updates: Record<string, unknown>) => ({
              eq: async (_field: string, id: string) => {
                const userIndex = adminState.users.findIndex((row) => row.id === id);
                if (userIndex === -1) {
                  return { error: { message: 'User not found' } };
                }

                adminState.users[userIndex] = {
                  ...adminState.users[userIndex],
                  ...updates,
                };
                return { error: null };
              },
            }),
          };
        }

        if (table === 'UserBadges') {
          return {
            select: jest.fn(() => ({
              order: () => ({
                limit: async () => ({
                  data: adminState.awards,
                  error: null,
                }),
              }),
              eq: (_field: string, id: string) => ({
                single: async () => {
                  if (adminState.failAwardLookup) {
                    return { data: null, error: { message: 'award lookup failed' } };
                  }

                  const award = adminState.awards.find((row) => row.id === id) || null;
                  return award
                    ? { data: award, error: null }
                    : { data: null, error: { message: 'Award not found' } };
                },
              }),
            })),
            insert: async (row: Pick<AdminAwardRow, 'badge_id' | 'awarded_to' | 'awarded_by'>) => {
              if (adminState.duplicateAward) {
                return { error: { code: '23505', message: 'duplicate award' } };
              }

              if (adminState.failAwardInsert) {
                return { error: { message: 'award insert failed' } };
              }

              adminState.awards.push({
                id: `award-${adminState.awards.length + 1}`,
                ...row,
                date_acquired: '2026-04-03T10:00:00.000Z',
              });
              return { error: null };
            },
            delete: () => ({
              eq: async (_field: string, id: string) => {
                if (adminState.failAwardDelete) {
                  return { error: { message: 'award delete failed' } };
                }

                adminState.awards = adminState.awards.filter((award) => award.id !== id);
                return { error: null };
              },
            }),
          };
        }

        if (table === 'user_collected_badges_view') {
          return {
            select: async () => ({
              data: adminState.failCollected
                ? null
                : [
                    {
                      awarded_to_id: badgeAssignmentUserMockData.id,
                      collected_badges: badgeAssignmentUserMockData.collected_badges,
                    },
                  ],
              error: adminState.failCollected ? { message: 'collected query failed' } : null,
            }),
          };
        }

        throw new Error(`Unexpected admin table ${table}`);
      }),
    };
  },
}));

beforeEach(() => {
  // Restore the mocked admin state for each badge-assignment scenario.
  toastSuccess.mockReset();
  toastError.mockReset();
  insertNotificationMock.mockClear();
  getUserRoleMock.mockReset();
  getUserRoleMock.mockResolvedValue({ role: 'manager', error: null });
  // Reset the in-memory admin fixture for each scenario.
  adminState = {
    badges: [manualBadgeMockData, automaticBadgeMockData],
    users: [
      {
        id: 'manager-1',
        name: 'Manager Seed',
        email: 'manager.seed@example.com',
        employee_id: null,
        points: 0,
      },
      {
        id: badgeAssignmentUserMockData.id,
        name: badgeAssignmentUserMockData.name,
        email: badgeAssignmentUserMockData.email,
        employee_id: badgeAssignmentUserMockData.employee_id,
        points: 10,
        total_points_earned: 10,
      },
    ],
    awards: [
      {
        id: badgeAwardDebugEntryMockData.id,
        badge_id: badgeAwardDebugEntryMockData.badge_id,
        awarded_to: badgeAwardDebugEntryMockData.awarded_to_id,
        awarded_by: badgeAwardDebugEntryMockData.awarded_by_id,
        date_acquired: badgeAwardDebugEntryMockData.date_acquired,
      },
    ],
  };
  createClientMock.mockResolvedValue({
    auth: {
      getUser: jest.fn(async () => ({
        data: {
          user: {
            id: 'manager-1',
            email: 'manager.seed@example.com',
            app_metadata: { user_role: 'manager' },
          },
        },
        error: null,
      })),
      getClaims: jest.fn(async () => ({
        data: {
          claims: {
            app_metadata: {
              user_role: 'manager',
            },
          },
        },
        error: null,
      })),
    },
  });
});

describe('When the manager loads manual badges', () => {
  test('Then the fetchManualBadges action returns only manual badges from the admin client', async () => {
    const result = await fetchManualBadges();

    expect(result.error).toBeNull();
    expect(result.data).toEqual([manualBadgeMockData]);
  });

  test('Then the handleFetchManualBadges handler returns an empty array and shows a toast when the query fails', async () => {
    adminState.failManualBadges = true;

    const result = await handleFetchManualBadges();

    expect(result).toEqual([]);
    expect(toastError).toHaveBeenCalled();
  });
});

describe('When the manager loads badge assignment users', () => {
  test('Then the fetchBadgeAssignmentUsers action returns users with collected badges and profile URLs', async () => {
    const result = await fetchBadgeAssignmentUsers();

    expect(result.error).toBeNull();
    expect(result.data?.find((user) => user.id === badgeAssignmentUserMockData.id)?.badge_ids).toEqual(
      badgeAssignmentUserMockData.badge_ids
    );
  });

  test('Then the handleFetchBadgeAssignmentUsers handler returns an empty array and shows a toast when collected badges fail to load', async () => {
    adminState.failCollected = true;

    const result = await handleFetchBadgeAssignmentUsers();

    expect(result).toEqual([]);
    expect(toastError).toHaveBeenCalled();
  });
});

describe('When the manager awards a manual badge', () => {
  test('Then the assignManualBadgeToUser action creates the award, updates user points, and inserts a notification', async () => {
    adminState.awards = [];

    const result = await assignManualBadgeToUser(manualBadgeMockData.id, badgeAssignmentUserMockData.id);

    expect(result.error).toBeNull();
    expect(adminState.awards).toHaveLength(1);
    expect(
      adminState.users.find((user) => user.id === badgeAssignmentUserMockData.id)?.points
    ).toBe(40);
    expect(insertNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: badgeAssignmentUserMockData.id,
        type: 'badge',
      })
    );
  });

  test('Then the handleAssignManualBadgeToUser handler returns false and shows a toast when the user already has the badge', async () => {
    adminState.duplicateAward = true;

    const result = await handleAssignManualBadgeToUser(
      manualBadgeMockData.id,
      badgeAssignmentUserMockData.id
    );

    expect(result).toBe(false);
    expect(toastError).toHaveBeenCalled();
  });
});

describe('When the manager loads badge award debug entries', () => {
  test('Then the fetchBadgeAwardDebugEntries action returns the normalized debug rows', async () => {
    const result = await fetchBadgeAwardDebugEntries();

    expect(result.error).toBeNull();
    expect(result.data?.[0].badge_name).toBe(badgeAwardDebugEntryMockData.badge_name);
  });

  test('Then the handleFetchBadgeAwardDebugEntries handler returns an empty array and shows a toast when the manager is unauthorized', async () => {
    getUserRoleMock.mockResolvedValueOnce({ role: 'regular', error: null });

    const result = await handleFetchBadgeAwardDebugEntries();

    expect(result).toEqual([]);
    expect(toastError).toHaveBeenCalled();
  });
});

describe('When the manager removes a badge award', () => {
  test('Then the removeBadgeAward action deletes the award and deducts the badge points from the user', async () => {
    const result = await removeBadgeAward(badgeAwardDebugEntryMockData.id);

    expect(result.error).toBeNull();
    expect(adminState.awards).toHaveLength(0);
    expect(
      adminState.users.find((user) => user.id === badgeAssignmentUserMockData.id)?.points
    ).toBe(0);
  });

  test('Then the handleRemoveBadgeAward handler returns false and shows a toast when the delete fails', async () => {
    adminState.failAwardDelete = true;

    const result = await handleRemoveBadgeAward(badgeAwardDebugEntryMockData.id);

    expect(result).toBe(false);
    expect(toastError).toHaveBeenCalled();
  });
});

describe('When the manager loads the full badge catalog', () => {
  test('Then the fetchAllBadges action returns both manual and automatic badges', async () => {
    const result = await fetchAllBadges();

    expect(result.error).toBeNull();
    expect(result.data?.map((badge) => badge.id)).toEqual([
      manualBadgeMockData.id,
      automaticBadgeMockData.id,
    ]);
  });
});
