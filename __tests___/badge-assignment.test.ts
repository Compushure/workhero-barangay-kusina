/**
 * ⚠️REMEMBER TO BE CAREFUL WITH INTEGRATION TESTING!!!!
 * ‼️‼️PLEASE - if possible comment out nyo danay until ma set up ang test db
 * BADGE ASSIGNMENT Management Tests
 * ===================================
 * Comprehensive test suite for manually assigning and removing badges.
 * Tests both happy paths (success scenarios) and sad paths (error scenarios).
 *
 * Test Coverage:
 * - Server actions: fetchManualBadges/fetchAllBadges (success, unauthorized, query error)
 * - fetchBadgeAssignmentUsers (success with collected badges, user/collected query errors)
 * - assignManualBadgeToUser (validation, role guard, badge lookup/interval, duplicate/insert error, RPC fallback, manual update failures)
 * - fetchBadgeAwardDebugEntries (success, role guard, award/badge/user fetch failures)
 * - removeBadgeAward (validation, role guard, award/badge fetch, delete failure, point adjustment errors, non-negative clamp)
 * - Handlers: success/error toasts for fetch/assign/remove/debug flows
 * - Integration: assign → debug → remove with try/finally cleanup guards
 */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
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
  handleFetchAllBadges,
  handleFetchBadgeAssignmentUsers,
  handleFetchBadgeAwardDebugEntries,
  handleFetchManualBadges,
  handleRemoveBadgeAward,
} from '@/action-handlers/manager/badge-assignment';
import type { BadgeAwardDebugEntry, BadgeAssignmentUser, BadgeSummary } from '@/types/manager/badge-assignment';

type BadgeRow = BadgeSummary & { created_by?: string | null };
type UserRow = {
  id: string;
  name: string;
  email: string;
  employee_id: string | null;
  points: number;
};
type UserBadgeRow = {
  id: string;
  badge_id: string;
  awarded_to: string;
  awarded_by: string | null;
  date_acquired: string;
};

type SafeActionFn = (fn: () => any) => Promise<{ success: boolean; data: any; error: any }>;
type ToastFn = (message?: any) => any;
type GetUserRoleFn = () => Promise<{ role: string | null; error: string | null }>;

let safeActionMock: jest.MockedFunction<SafeActionFn>;
let toastSuccess: jest.MockedFunction<ToastFn>;
let toastError: jest.MockedFunction<ToastFn>;
let getUserRoleMock: jest.MockedFunction<GetUserRoleFn>;

jest.mock('@/lib/utils/safe-action', () => ({
  safeAction: jest.fn(async (fn: () => any) => {
    try {
      const data = await fn();
      return { success: true, data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      return { success: false, data: null, error: message };
    }
  }),
}));

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

jest.mock('@/actions/shared/auth', () => ({ getUserRole: jest.fn() }));

const { safeAction } = jest.requireMock('@/lib/utils/safe-action') as { safeAction: jest.MockedFunction<SafeActionFn> };
safeActionMock = safeAction;
const { toast } = jest.requireMock('sonner') as { toast: { success: jest.MockedFunction<ToastFn>; error: jest.MockedFunction<ToastFn> } };
toastSuccess = toast.success;
toastError = toast.error;
const { getUserRole } = jest.requireMock('@/actions/shared/auth') as { getUserRole: jest.MockedFunction<GetUserRoleFn> };
getUserRoleMock = getUserRole;

type SupabaseConfig = {
  failManualBadgeQuery?: boolean;
  failAllBadgeQuery?: boolean;
  failUserQuery?: boolean;
  failCollectedQuery?: boolean;
  failBadgeLookup?: boolean;
  failAwardInsert?: boolean;
  duplicateAward?: boolean;
  failPointsRpc?: boolean;
  failUserFetch?: boolean;
  failUserPointsUpdate?: boolean;
  failAwardList?: boolean;
  failBadgeInfoForDebug?: boolean;
  failUserInfoForDebug?: boolean;
  failAwardRowFetch?: boolean;
  failBadgePointsFetch?: boolean;
  failAwardDelete?: boolean;
};

let supabaseConfig: SupabaseConfig = {};

const memDb = {
  badges: [] as BadgeRow[],
  users: [] as UserRow[],
  userBadges: [] as UserBadgeRow[],
};

const BASE_BADGES: BadgeRow[] = [
  {
    id: 'badge-manual',
    name: 'Manual Star',
    description: 'Manual award',
    points: 50,
    img_link: 'https://cdn/badges/manual.png',
    award_at_interval: 'none',
    created_by: 'manager-1',
  },
  {
    id: 'badge-auto',
    name: 'Auto Badge',
    description: 'Automatic award',
    points: 20,
    img_link: null,
    award_at_interval: 'monthly',
    created_by: 'manager-1',
  },
];

const BASE_USERS: UserRow[] = [
  { id: 'manager-1', name: 'Manager One', email: 'manager@example.com', employee_id: null, points: 0 },
  { id: 'user-1', name: 'Alice Employee', email: 'alice@example.com', employee_id: 'E-1', points: 10 },
  { id: 'user-2', name: 'Bob Employee', email: 'bob@example.com', employee_id: 'E-2', points: 5 },
];

const buildCollectedRows = () => {
  const rows: { awarded_to_id: string; collected_badges: any[] }[] = [];
  memDb.users.forEach((user) => {
    const collected = memDb.userBadges
      .filter((ub) => ub.awarded_to === user.id)
      .map((ub) => {
        const badge = memDb.badges.find((b) => b.id === ub.badge_id);
        const awardedBy = memDb.users.find((u) => u.id === ub.awarded_by);
        return {
          userbadge_id: ub.id,
          badge_id: ub.badge_id,
          badge_name: badge?.name ?? 'Unknown badge',
          awarded_by_id: ub.awarded_by,
          awarded_by_name: awardedBy?.name ?? null,
          date_acquired: ub.date_acquired,
        };
      });
    rows.push({ awarded_to_id: user.id, collected_badges: collected });
  });
  return rows;
};

const makeSupabaseAdmin = () => {
  const getPublicUrl = jest.fn((path: string) => ({ data: { publicUrl: `https://cdn/employees/${path}` } }));

  const admin = {
    storage: {
      from: jest.fn(() => ({ getPublicUrl })),
    },
    rpc: jest.fn(async (fnName: string, args: { target_user_id: string; amount: number }) => {
      if (fnName !== 'increment_points_for_user') {
        return { data: null, error: { message: 'unknown rpc' } };
      }
      if (supabaseConfig.failPointsRpc) {
        return { data: null, error: { message: 'rpc fail' } };
      }
      const user = memDb.users.find((u) => u.id === args.target_user_id);
      if (user) {
        user.points = (user.points ?? 0) + (args.amount ?? 0);
      }
      return { data: null, error: null };
    }),
    from: jest.fn((table: string) => {
      if (table === 'Badges') {
        return {
          select: () => ({
            eq: (field: string, value: string) => ({
              order: () => ({
                data: supabaseConfig.failManualBadgeQuery
                  ? null
                  : memDb.badges
                      .filter((b) => (field === 'award_at_interval' ? b.award_at_interval === value : true))
                      .sort((a, b) => a.name.localeCompare(b.name)),
                error: supabaseConfig.failManualBadgeQuery ? { message: 'manual badges fail' } : null,
              }),
              single: async () => {
                if (supabaseConfig.failBadgeLookup || supabaseConfig.failBadgePointsFetch) {
                  return {
                    data: null,
                    error: { message: supabaseConfig.failBadgeLookup ? 'badge lookup fail' : 'badge points fail' },
                  };
                }
                const row = memDb.badges.find((b) => b.id === value) ?? null;
                return row ? { data: row, error: null } : { data: null, error: { message: 'not found' } };
              },
            }),
            order: () => ({
              data: supabaseConfig.failAllBadgeQuery
                ? null
                : [...memDb.badges].sort((a, b) => a.name.localeCompare(b.name)),
              error: supabaseConfig.failAllBadgeQuery ? { message: 'all badges fail' } : null,
            }),
            in: (_field: string, ids: string[]) => ({
              data: supabaseConfig.failBadgeInfoForDebug ? null : memDb.badges.filter((b) => ids.includes(b.id)),
              error: supabaseConfig.failBadgeInfoForDebug ? { message: 'badge info fail' } : null,
            }),
          }),
        } as any;
      }

      if (table === 'User') {
        return {
          select: () => ({
            order: () => ({
              data: supabaseConfig.failUserQuery
                ? null
                : [...memDb.users].sort((a, b) => a.name.localeCompare(b.name)),
              error: supabaseConfig.failUserQuery ? { message: 'user fetch fail' } : null,
            }),
            in: (_field: string, ids: string[]) => ({
              data: supabaseConfig.failUserInfoForDebug ? null : memDb.users.filter((u) => ids.includes(u.id)),
              error: supabaseConfig.failUserInfoForDebug ? { message: 'user info fail' } : null,
            }),
            eq: (_field: string, id: string) => ({
              single: async () => {
                if (supabaseConfig.failUserFetch) {
                  return { data: null, error: { message: 'user fetch fail' } };
                }
                const row = memDb.users.find((u) => u.id === id) ?? null;
                return row ? { data: row, error: null } : { data: null, error: { message: 'not found' } };
              },
            }),
          }),
          update: (updates: Partial<UserRow>) => ({
            eq: (_field: string, id: string) => {
              if (supabaseConfig.failUserPointsUpdate) {
                return { error: { message: 'user update fail' } };
              }
              const idx = memDb.users.findIndex((u) => u.id === id);
              if (idx === -1) {
                return { error: { message: 'not found' } };
              }
              memDb.users[idx] = { ...memDb.users[idx], ...updates } as UserRow;
              return { error: null };
            },
          }),
        } as any;
      }

      if (table === 'UserBadges') {
        return {
          select: () => ({
            order: () => ({
              limit: () => ({
                data: supabaseConfig.failAwardList ? null : [...memDb.userBadges],
                error: supabaseConfig.failAwardList ? { message: 'award list fail' } : null,
              }),
            }),
            eq: (_field: string, id: string) => ({
              single: async () => {
                if (supabaseConfig.failAwardRowFetch) {
                  return { data: null, error: { message: 'award fetch fail' } };
                }
                const row = memDb.userBadges.find((ub) => ub.id === id) ?? null;
                return row ? { data: row, error: null } : { data: null, error: { message: 'Not found' } };
              },
            }),
          }),
          insert: (rows: any[]) => {
            if (supabaseConfig.duplicateAward) {
              return { error: { code: '23505', message: 'duplicate' } } as any;
            }
            if (supabaseConfig.failAwardInsert) {
              return { error: { message: 'award insert fail' } } as any;
            }
            const row = Array.isArray(rows) ? rows[0] : rows;
            const next: UserBadgeRow = {
              id: `award-${memDb.userBadges.length + 1}`,
              badge_id: row.badge_id,
              awarded_to: row.awarded_to,
              awarded_by: row.awarded_by ?? null,
              date_acquired: row.date_acquired ?? '2024-01-01T00:00:00.000Z',
            };
            memDb.userBadges.push(next);
            return { error: null } as any;
          },
          delete: () => ({
            eq: (_field: string, id: string) => {
              if (supabaseConfig.failAwardDelete) {
                return { error: { message: 'award delete fail' } } as any;
              }
              const idx = memDb.userBadges.findIndex((ub) => ub.id === id);
              if (idx === -1) {
                return { error: { message: 'not found' } } as any;
              }
              memDb.userBadges.splice(idx, 1);
              return { error: null } as any;
            },
          }),
        } as any;
      }

      if (table === 'user_collected_badges_view') {
        return {
          select: () => ({
            data: supabaseConfig.failCollectedQuery ? null : buildCollectedRows(),
            error: supabaseConfig.failCollectedQuery ? { message: 'collected fail' } : null,
          }),
        } as any;
      }

      return {} as any;
    }),
  };

  return admin as any;
};

const makeSupabaseClient = () => ({
  auth: {
    getUser: jest.fn(async () => ({ data: { user: { id: 'manager-1' } }, error: null })),
  },
});

let supabaseAdminMock = makeSupabaseAdmin();
let supabaseClientMock = makeSupabaseClient();

jest.mock('@/lib/supabase/admin', () => ({
  get supabaseAdmin() {
    return supabaseAdminMock;
  },
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => supabaseClientMock),
}));

const resetState = () => {
  memDb.badges.splice(0, memDb.badges.length, ...BASE_BADGES.map((b) => ({ ...b })));
  memDb.users.splice(0, memDb.users.length, ...BASE_USERS.map((u) => ({ ...u })));
  memDb.userBadges.splice(0, memDb.userBadges.length);
  supabaseConfig = {};
  supabaseAdminMock = makeSupabaseAdmin();
  supabaseClientMock = makeSupabaseClient();
  safeActionMock?.mockClear();
  toastSuccess?.mockClear();
  toastError?.mockClear();
  getUserRoleMock?.mockReset();
  getUserRoleMock?.mockResolvedValue({ role: 'manager', error: null });
};

afterEach(() => resetState());

describe('Badge Assignment Server Actions', () => {
  beforeEach(() => resetState());

  describe('fetchManualBadges and fetchAllBadges', () => {
    test('fetchManualBadges returns only manual badges ordered by name', async () => {
      const result = await fetchManualBadges();
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].award_at_interval).toBe('none');
    });

    test('fetchManualBadges returns unauthorized when role is not manager', async () => {
      getUserRoleMock.mockResolvedValueOnce({ role: 'employee', error: null });
      const result = await fetchManualBadges();
      expect(result.error).toContain('Unauthorized');
    });

    test('fetchManualBadges surfaces query errors', async () => {
      supabaseConfig.failManualBadgeQuery = true;
      const result = await fetchManualBadges();
      expect(result.error).toContain('manual badges fail');
      expect(result.data).toBeUndefined();
    });

    test('fetchAllBadges returns all badges and orders by name', async () => {
      const result = await fetchAllBadges();
      expect(result.error).toBeNull();
      expect(result.data?.map((b) => b.name)).toEqual(['Auto Badge', 'Manual Star']);
    });

    test('fetchAllBadges surfaces query errors', async () => {
      supabaseConfig.failAllBadgeQuery = true;
      const result = await fetchAllBadges();
      expect(result.error).toContain('all badges fail');
    });
  });

  describe('fetchBadgeAssignmentUsers', () => {
    test('returns users with collected badges and profile URLs', async () => {
      memDb.userBadges.push({
        id: 'award-1',
        badge_id: 'badge-manual',
        awarded_to: 'user-1',
        awarded_by: 'manager-1',
        date_acquired: '2024-02-01T00:00:00.000Z',
      });

      const result = await fetchBadgeAssignmentUsers();
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(3);
      const alice = result.data?.find((u) => u.id === 'user-1') as BadgeAssignmentUser;
      expect(alice.badge_ids).toContain('badge-manual');
      expect(alice.profilePictureUrl).toContain('user-1/profile.png');
    });

    test('returns error when user query fails', async () => {
      supabaseConfig.failUserQuery = true;
      const result = await fetchBadgeAssignmentUsers();
      expect(result.error).toContain('Failed to fetch users');
    });

    test('returns error when collected badges query fails', async () => {
      supabaseConfig.failCollectedQuery = true;
      const result = await fetchBadgeAssignmentUsers();
      expect(result.error).toContain('Failed to fetch user badges');
    });
  });

  describe('assignManualBadgeToUser', () => {
    test('awards manual badge and increments points via RPC', async () => {
      const result = await assignManualBadgeToUser('badge-manual', 'user-1');
      expect(result.error).toBeNull();
      expect(memDb.userBadges).toHaveLength(1);
      expect(memDb.users.find((u) => u.id === 'user-1')?.points).toBe(60);
    });

    test('returns validation error when ids missing', async () => {
      const result = await assignManualBadgeToUser('', '');
      expect(result.error).toContain('Badge and user are required');
    });

    test('requires manager role', async () => {
      getUserRoleMock.mockResolvedValueOnce({ role: 'employee', error: null });
      const result = await assignManualBadgeToUser('badge-manual', 'user-1');
      expect(result.error).toContain('Unauthorized');
    });

    test('returns error when badge lookup fails', async () => {
      supabaseConfig.failBadgeLookup = true;
      const result = await assignManualBadgeToUser('badge-manual', 'user-1');
      expect(result.error).toContain('Failed to verify badge');
    });

    test('blocks automatic badges', async () => {
      const result = await assignManualBadgeToUser('badge-auto', 'user-1');
      expect(result.error).toContain('Only manual badges');
    });

    test('handles duplicate awards gracefully', async () => {
      supabaseConfig.duplicateAward = true;
      const result = await assignManualBadgeToUser('badge-manual', 'user-1');
      expect(result.error).toBe('User already has this badge');
    });

    test('propagates insert failures', async () => {
      supabaseConfig.failAwardInsert = true;
      const result = await assignManualBadgeToUser('badge-manual', 'user-1');
      expect(result.error).toContain('Failed to award badge');
    });

    test('uses manual fallback when RPC fails and still updates points', async () => {
      supabaseConfig.failPointsRpc = true;
      const result = await assignManualBadgeToUser('badge-manual', 'user-1');
      expect(result.error).toBeNull();
      expect(memDb.users.find((u) => u.id === 'user-1')?.points).toBe(60);
    });

    test('returns error if fallback user fetch fails', async () => {
      supabaseConfig.failPointsRpc = true;
      supabaseConfig.failUserFetch = true;
      const result = await assignManualBadgeToUser('badge-manual', 'user-1');
      expect(result.error).toContain('Failed to add points after awarding badge');
    });

    test('returns error if fallback update fails', async () => {
      supabaseConfig.failPointsRpc = true;
      supabaseConfig.failUserPointsUpdate = true;
      const result = await assignManualBadgeToUser('badge-manual', 'user-1');
      expect(result.error).toContain('Failed to add points after awarding badge');
    });
  });

  describe('fetchBadgeAwardDebugEntries', () => {
    test('returns award debug entries with badge and user info', async () => {
      memDb.userBadges.push({
        id: 'award-1',
        badge_id: 'badge-manual',
        awarded_to: 'user-1',
        awarded_by: 'manager-1',
        date_acquired: '2024-02-05T00:00:00.000Z',
      });

      const result = await fetchBadgeAwardDebugEntries();
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      const entry = result.data?.[0] as BadgeAwardDebugEntry;
      expect(entry.badge_name).toBe('Manual Star');
      expect(entry.awarded_to_name).toBe('Alice Employee');
    });

    test('returns unauthorized for non-managers', async () => {
      getUserRoleMock.mockResolvedValueOnce({ role: 'employee', error: null });
      const result = await fetchBadgeAwardDebugEntries();
      expect(result.error).toContain('Unauthorized');
    });

    test('surfaces award list errors', async () => {
      supabaseConfig.failAwardList = true;
      const result = await fetchBadgeAwardDebugEntries();
      expect(result.error).toContain('Failed to fetch badge awards');
    });

    test('surfaces badge info errors', async () => {
      supabaseConfig.failBadgeInfoForDebug = true;
      const result = await fetchBadgeAwardDebugEntries();
      expect(result.error).toContain('Failed to fetch badges');
    });

    test('surfaces user info errors', async () => {
      supabaseConfig.failUserInfoForDebug = true;
      const result = await fetchBadgeAwardDebugEntries();
      expect(result.error).toContain('Failed to fetch users');
    });
  });

  describe('removeBadgeAward', () => {
    beforeEach(() => {
      memDb.userBadges.push({
        id: 'award-1',
        badge_id: 'badge-manual',
        awarded_to: 'user-1',
        awarded_by: 'manager-1',
        date_acquired: '2024-02-01T00:00:00.000Z',
      });
      const alice = memDb.users.find((u) => u.id === 'user-1');
      if (alice) alice.points = 60;
    });

    test('removes award and deducts points but not below zero', async () => {
      const result = await removeBadgeAward('award-1');
      expect(result.error).toBeNull();
      expect(memDb.userBadges).toHaveLength(0);
      expect(memDb.users.find((u) => u.id === 'user-1')?.points).toBe(10);
    });

    test('returns validation error when id missing', async () => {
      const result = await removeBadgeAward('');
      expect(result.error).toContain('Award id is required');
    });

    test('requires manager role', async () => {
      getUserRoleMock.mockResolvedValueOnce({ role: 'hr', error: null });
      const result = await removeBadgeAward('award-1');
      expect(result.error).toContain('Unauthorized');
    });

    test('returns error when award fetch fails', async () => {
      supabaseConfig.failAwardRowFetch = true;
      const result = await removeBadgeAward('award-1');
      expect(result.error).toContain('Failed to locate badge award');
    });

    test('returns error when badge points fetch fails', async () => {
      supabaseConfig.failBadgePointsFetch = true;
      const result = await removeBadgeAward('award-1');
      expect(result.error).toContain('Failed to load badge points');
    });

    test('surfaces delete failure', async () => {
      supabaseConfig.failAwardDelete = true;
      const result = await removeBadgeAward('award-1');
      expect(result.error).toContain('Failed to remove badge award');
    });

    test('handles user fetch failure during point adjustment', async () => {
      supabaseConfig.failUserFetch = true;
      const result = await removeBadgeAward('award-1');
      expect(result.error).toContain('Failed to adjust user points');
    });

    test('handles update failure during point adjustment', async () => {
      supabaseConfig.failUserPointsUpdate = true;
      const result = await removeBadgeAward('award-1');
      expect(result.error).toContain('Failed to adjust user points');
    });

    test('clamps deduction to zero when user has fewer points', async () => {
      const alice = memDb.users.find((u) => u.id === 'user-1');
      if (alice) alice.points = 10;
      const result = await removeBadgeAward('award-1');
      expect(result.error).toBeNull();
      expect(memDb.users.find((u) => u.id === 'user-1')?.points).toBe(0);
    });
  });
});

describe('Badge Assignment Handlers (safeAction + toast)', () => {
  beforeEach(() => resetState());

  test('handleFetchManualBadges returns data without error toast', async () => {
    const data = await handleFetchManualBadges();
    expect(data).toHaveLength(1);
    expect(toastError).not.toHaveBeenCalled();
  });

  test('handleFetchManualBadges surfaces error via toast', async () => {
    supabaseConfig.failManualBadgeQuery = true;
    const data = await handleFetchManualBadges();
    expect(data).toEqual([]);
    expect(toastError).toHaveBeenCalled();
  });

  test('handleAssignManualBadgeToUser shows success toast', async () => {
    const ok = await handleAssignManualBadgeToUser('badge-manual', 'user-1');
    expect(ok).toBe(true);
    expect(toastSuccess).toHaveBeenCalledWith('Badge awarded');
  });

  test('handleAssignManualBadgeToUser shows error toast on failure', async () => {
    supabaseConfig.failBadgeLookup = true;
    const ok = await handleAssignManualBadgeToUser('badge-manual', 'user-1');
    expect(ok).toBe(false);
    expect(toastError).toHaveBeenCalled();
  });

  test('handleRemoveBadgeAward shows success toast', async () => {
    memDb.userBadges.push({
      id: 'award-1',
      badge_id: 'badge-manual',
      awarded_to: 'user-1',
      awarded_by: 'manager-1',
      date_acquired: '2024-02-01T00:00:00.000Z',
    });
    const ok = await handleRemoveBadgeAward('award-1');
    expect(ok).toBe(true);
    expect(toastSuccess).toHaveBeenCalledWith('Badge removed');
  });

  test('handleRemoveBadgeAward surfaces errors via toast', async () => {
    const ok = await handleRemoveBadgeAward('award-1');
    expect(ok).toBe(false);
    expect(toastError).toHaveBeenCalled();
  });

  test('handleFetchBadgeAwardDebugEntries returns data and handles errors', async () => {
    memDb.userBadges.push({
      id: 'award-1',
      badge_id: 'badge-manual',
      awarded_to: 'user-1',
      awarded_by: 'manager-1',
      date_acquired: '2024-02-01T00:00:00.000Z',
    });

    const entries = await handleFetchBadgeAwardDebugEntries();
    expect(entries).toHaveLength(1);

    supabaseConfig.failAwardList = true;
    const empty = await handleFetchBadgeAwardDebugEntries();
    expect(empty).toEqual([]);
    expect(toastError).toHaveBeenCalled();
  });
});

describe('Integration - assign → debug → remove', () => {
  beforeEach(() => resetState());

  test('awards a badge then removes it with cleanup guards', async () => {
    let createdAwardId: string | null = null;
    try {
      const awarded = await handleAssignManualBadgeToUser('badge-manual', 'user-1');
      expect(awarded).toBe(true);
      createdAwardId = memDb.userBadges[0]?.id ?? null;

      const users = await handleFetchBadgeAssignmentUsers();
      const alice = users.find((u) => u.id === 'user-1');
      expect(alice?.badge_ids).toContain('badge-manual');

      const debugEntries = await handleFetchBadgeAwardDebugEntries();
      expect(debugEntries).toHaveLength(1);

      if (createdAwardId) {
        const removed = await handleRemoveBadgeAward(createdAwardId);
        expect(removed).toBe(true);
        createdAwardId = null;
      }

      const finalDebug = await handleFetchBadgeAwardDebugEntries();
      expect(finalDebug).toHaveLength(0);
    } finally {
      if (createdAwardId) {
        memDb.userBadges = memDb.userBadges.filter((ub) => ub.id !== createdAwardId);
      }
    }
  });
});
