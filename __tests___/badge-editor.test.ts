/**
 * ⚠️REMEMBER TO BE CAREFUL WITH INTEGRATION TESTING!!!!
 * ‼️‼️PLEASE - if possible comment out nyo danay until ma set up ang test db
 * BADGE EDITOR Management Tests
 * ===================================
 * Comprehensive test suite for badge creation, editing, and deletion.
 * Tests both happy paths (success scenarios) and sad paths (error scenarios).
 * 
 * Test Coverage: ()
 *
 */
import {
  fetchBadges,
  fetchBadgeTaskOptions,
  fetchBadgeAttributeOptions,
  fetchBadgeAttendanceOptions,
  uploadBadgeImage,
  deleteBadgeImage,
  addBadge,
  editBadge,
  deleteBadge,
} from '@/actions/manager/badges';
import {
  handleFetchBadges,
  handleFetchBadgeTaskOptions,
  handleFetchBadgeAttributeOptions,
  handleFetchBadgeAttendanceOptions,
  handleAddBadge,
  handleEditBadge,
  handleDeleteBadge,
  handleUploadBadgeImage,
  handleDeleteBadgeImage,
} from '@/action-handlers/manager/badges';
import type { Badge, BadgeCondition, BadgeOption } from '@/types/manager/badge-editor';
import type { AddBadgeInput, EditBadgeInput } from '@/zod/schemas/badge';

let safeActionMock: jest.Mock<Promise<{ success: boolean; data: any }>, [() => any]>;
let toastSuccess: jest.Mock;
let toastError: jest.Mock;

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

const { safeAction } = jest.requireMock('@/lib/utils/safe-action') as { safeAction: jest.Mock };
safeActionMock = safeAction;
const { toast } = jest.requireMock('sonner') as { toast: { success: jest.Mock; error: jest.Mock } };
toastSuccess = toast.success;
toastError = toast.error;

const mockGetPublicUrl = jest.fn();
const mockUpload = jest.fn();
const mockRemove = jest.fn();

type BadgeRow = {
  id: string;
  name: string;
  description: string | null;
  points: number;
  award_at_interval: string;
  img_link: string | null;
  created_by: string | null;
};

const memDb = {
  badges: [] as BadgeRow[],
  requirements: [] as BadgeCondition[],
  categories: [
    { id: 'k1', name: 'Quality' },
    { id: 'k2', name: 'Speed' },
  ] as BadgeOption[],
};

type SupabaseMockCfg = {
  failBadgeQuery?: boolean;
  failTaskQuery?: boolean;
  failUpload?: boolean;
  failImageUpdate?: boolean;
  failImageDelete?: boolean;
  failBadgeInsert?: boolean;
  failBadgeUpdate?: boolean;
  failBadgeDelete?: boolean;
  failRequirementInsert?: boolean;
};

let supabaseConfig: SupabaseMockCfg = {};

const buildBadgeViewRows = () =>
  memDb.badges.map((badge) => ({
    badge_id: badge.id,
    badge_name: badge.name,
    badge_description: badge.description,
    badge_points: badge.points,
    badge_img_link: badge.img_link,
    badge_award_at_interval: badge.award_at_interval,
    badge_created_at: '2024-01-01T00:00:00.000Z',
    badge_created_by_name: 'Manager One',
    created_by_name: 'Manager One',
    conditions: memDb.requirements
      .filter((r) => r.id && String(r.id).startsWith(`${badge.id}-`))
      .map((r) => ({ ...r })),
  }));

const makeSupabaseClient = () => {
  return {
    auth: {
      getUser: jest.fn(async () => ({ data: { user: { id: 'manager-1' } } })),
    },
    storage: {
      from: jest.fn(() => ({
        upload: mockUpload,
        remove: mockRemove,
        getPublicUrl: mockGetPublicUrl,
      })),
    },
    from: jest.fn((table: string) => {
      if (table === 'badge_conditions_view') {
        return {
          select: () => ({
            order: () => ({ data: supabaseConfig.failBadgeQuery ? null : buildBadgeViewRows(), error: supabaseConfig.failBadgeQuery ? { message: 'fetch fail' } : null }),
          }),
        } as any;
      }

      if (table === 'KPICategory') {
        return {
          select: () => ({
            order: () => ({ data: supabaseConfig.failTaskQuery ? null : [...memDb.categories], error: supabaseConfig.failTaskQuery ? { message: 'task fail' } : null }),
          }),
        } as any;
      }

      if (table === 'Badges') {
        return {
          insert: (rows: any[]) => {
            if (supabaseConfig.failBadgeInsert) {
              return { select: () => ({ single: async () => ({ data: null, error: { message: 'insert fail' } }) }) } as any;
            }
            const row = Array.isArray(rows) ? rows[0] : rows;
            const newRow: BadgeRow = {
              id: `badge-${memDb.badges.length + 1}`,
              name: row.name,
              description: row.description ?? null,
              points: row.points,
              award_at_interval: row.award_at_interval,
              img_link: row.img_link ?? null,
              created_by: row.created_by ?? null,
            };
            memDb.badges.push(newRow);
            return {
              select: () => ({
                single: async () => ({ data: newRow, error: null }),
              }),
            } as any;
          },
          update: (updates: any) => {
            return {
              eq: (_field: string, id: string) => {
                const isImageUpdate = Object.prototype.hasOwnProperty.call(updates, 'img_link');
                const message = supabaseConfig.failBadgeUpdate
                  ? 'update fail'
                  : supabaseConfig.failImageUpdate && isImageUpdate && updates.img_link !== null
                    ? 'update fail'
                    : supabaseConfig.failImageDelete && isImageUpdate && updates.img_link === null
                      ? 'update fail'
                      : null;
                if (message) {
                  return {
                    error: { message },
                    select: () => ({ single: async () => ({ data: null, error: { message } }) }),
                  } as any;
                }
                const idx = memDb.badges.findIndex((b) => b.id === id);
                if (idx === -1) {
                  return {
                    error: { message: 'not found' },
                    select: () => ({ single: async () => ({ data: null, error: { message: 'not found' } }) }),
                  } as any;
                }
                memDb.badges[idx] = { ...memDb.badges[idx], ...updates } as BadgeRow;
                return {
                  error: null,
                  select: () => ({
                    single: async () => ({ data: memDb.badges[idx], error: null }),
                  }),
                } as any;
              },
            } as any;
          },
          delete: () => ({
            eq: (_field: string, id: string) => {
              if (supabaseConfig.failBadgeDelete) {
                return { error: { message: 'delete fail' } } as any;
              }
              const idx = memDb.badges.findIndex((b) => b.id === id);
              if (idx === -1) {
                return { error: { message: 'not found' } } as any;
              }
              memDb.badges.splice(idx, 1);
              memDb.requirements = memDb.requirements.filter((r) => !String(r.id).startsWith(`${id}-`));
              return { error: null } as any;
            },
          }),
        } as any;
      }

      if (table === 'BadgeRequirements') {
        return {
          insert: (rows: any[]) => {
            if (supabaseConfig.failRequirementInsert) {
              return { select: () => ({ data: null, error: { message: 'req fail' } }) } as any;
            }
            const inserted = rows.map((r, idx) => ({
              id: `${r.badge_id}-${idx + 1}`,
              requirement_type: r.requirement_type,
              requirement_operator: r.requirement_operator,
              requirement_attrb_id: r.requirement_attrb_id,
              requirement_attrb_value: r.requirement_attrb_value,
              requirement_interval: r.requirement_interval ?? 'none',
              logic_type: r.logic_type ?? 'and',
            }));
            memDb.requirements.push(...inserted);
            return { select: () => ({ data: inserted, error: null }) } as any;
          },
          delete: () => ({
            eq: (_field: string, id: string) => {
              if (supabaseConfig.failRequirementInsert) {
                return { error: { message: 'delete requirements failed' } } as any;
              }
              memDb.requirements = memDb.requirements.filter((r) => !String(r.id).startsWith(`${id}-`));
              return { error: null } as any;
            },
          }),
        } as any;
      }

      return {} as any;
    }),
  };
};

let supabaseClient: any = makeSupabaseClient();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => supabaseClient),
}));

const resetState = () => {
  memDb.badges.splice(0, memDb.badges.length);
  memDb.requirements.splice(0, memDb.requirements.length);
  supabaseConfig = {};
  supabaseClient = makeSupabaseClient();
  mockUpload.mockReset();
  mockRemove.mockReset();
  mockGetPublicUrl.mockReset();
  mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn/badges/default.png' } });
  safeActionMock?.mockClear();
  toastSuccess?.mockClear();
  toastError?.mockClear();
  Date.now = () => 1700000000000;
};

afterEach(() => resetState());

const VALID_BADGE: AddBadgeInput = {
  name: 'Punctuality',
  description: 'Awarded for arriving on time',
  points: 50,
  award_at_interval: 'none',
  img_link: null,
  conditions: [
    {
      requirement_type: 'task',
      requirement_operator: '>',
      requirement_attrb_id: 'k1',
      requirement_attrb_value: 5,
      logic_type: 'and',
    },
  ],
};

const EDIT_BADGE: EditBadgeInput = {
  name: 'Consistency',
  description: 'Updated badge',
  points: 75,
  award_at_interval: 'monthly',
  img_link: 'https://cdn/badge-new.png',
  conditions: [
    {
      requirement_type: 'attribute',
      requirement_operator: '>=',
      requirement_attrb_id: 'total_points_earned',
      requirement_attrb_value: 100,
      logic_type: 'or',
    },
  ],
};

describe('Badge Editor Server Actions', () => {
  beforeEach(() => resetState());

  describe('fetchBadges', () => {
    test('returns normalized badges', async () => {
      memDb.badges.push({
        id: 'badge-1',
        name: 'Reliability',
        description: 'Always shows up',
        points: 30,
        award_at_interval: 'none',
        img_link: 'https://cdn/badge.png',
        created_by: 'manager-1',
      });
      memDb.requirements.push({
        id: 'badge-1-1',
        requirement_type: 'task',
        requirement_operator: '>',
        requirement_attrb_id: 'k1',
        requirement_attrb_value: 3,
        requirement_interval: 'none',
        logic_type: 'and',
      });

      const result = await fetchBadges();
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].conditions[0].requirement_attrb_value).toBe(3);
    });

    test('returns error on query failure', async () => {
      supabaseConfig.failBadgeQuery = true;
      const result = await fetchBadges();
      expect(result.error).toContain('fetch fail');
      expect(result.data).toBeUndefined();
    });
  });

  describe('fetch badge options', () => {
    test('returns task options', async () => {
      const result = await fetchBadgeTaskOptions();
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
    });

    test('handles task option error', async () => {
      supabaseConfig.failTaskQuery = true;
      const result = await fetchBadgeTaskOptions();
      expect(result.error).toContain('task fail');
    });

    test('attribute options are static', async () => {
      const result = await fetchBadgeAttributeOptions();
      expect(result.data).toEqual([
        { id: 'user_level', name: 'User Level' },
        { id: 'total_xp', name: 'Total XP' },
        { id: 'total_points_earned', name: 'Total Points Earned' },
      ]);
    });

    test('attendance options are static', async () => {
      const result = await fetchBadgeAttendanceOptions();
      expect(result.data?.[0].id).toBe('is_overtime');
      expect(result.error).toBeNull();
    });
  });

  describe('uploadBadgeImage', () => {
    beforeEach(() => {
      memDb.badges.push({
        id: 'badge-1',
        name: 'Seed Badge',
        description: null,
        points: 10,
        award_at_interval: 'none',
        img_link: null,
        created_by: 'manager-1',
      });
    });

    test('rejects oversized file', async () => {
      const largeFile = { size: 6 * 1024 * 1024, type: 'image/png' } as any;
      const result = await uploadBadgeImage('badge-1', largeFile);
      expect(result.error).toContain('5MB');
    });

    test('rejects unsupported type', async () => {
      const file = { size: 1000, type: 'image/gif' } as any;
      const result = await uploadBadgeImage('badge-1', file);
      expect(result.error).toContain('Only JPEG');
    });

    test('returns error when upload fails', async () => {
      mockUpload.mockResolvedValueOnce({ data: null, error: { message: 'upload boom' } });
      const file = { size: 1000, type: 'image/png' } as any;
      const result = await uploadBadgeImage('badge-1', file);
      expect(result.error).toContain('upload boom');
    });

    test('returns error when update fails', async () => {
      mockUpload.mockResolvedValueOnce({ data: { path: 'p' }, error: null });
      supabaseConfig.failImageUpdate = true;
      const file = { size: 1000, type: 'image/png' } as any;
      const result = await uploadBadgeImage('badge-1', file);
      expect(result.error).toContain('update badge image');
    });

    test('uploads and returns public url', async () => {
      mockUpload.mockResolvedValueOnce({ data: { path: 'p' }, error: null });
      mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn/badges/badge-1/badge.png' } });
      const file = { size: 1000, type: 'image/png' } as any;
      const result = await uploadBadgeImage('badge-1', file);
      expect(result.error).toBeNull();
      expect(result.data?.publicUrl).toContain('?t=1700000000000');
    });
  });

  describe('deleteBadgeImage', () => {
    beforeEach(() => {
      memDb.badges.push({
        id: 'badge-1',
        name: 'Seed Badge',
        description: null,
        points: 10,
        award_at_interval: 'none',
        img_link: 'https://cdn/badges/badge-1/badge.png',
        created_by: 'manager-1',
      });
    });

    test('removes image and clears column', async () => {
      mockRemove.mockResolvedValueOnce({ data: null, error: null });
      const result = await deleteBadgeImage('badge-1');
      expect(result.error).toBeNull();
      expect(mockRemove).toHaveBeenCalledWith(['badge-1/badge.png']);
    });

    test('handles storage removal error', async () => {
      mockRemove.mockResolvedValueOnce({ data: null, error: { message: 'remove fail' } });
      const result = await deleteBadgeImage('badge-1');
      expect(result.error).toContain('remove fail');
    });

    test('handles badge image clear error', async () => {
      mockRemove.mockResolvedValueOnce({ data: null, error: null });
      supabaseConfig.failImageDelete = true;
      supabaseClient = makeSupabaseClient();
      const spy = jest.spyOn(supabaseClient, 'from');
      const result = await deleteBadgeImage('badge-1');
      expect(result.error).toContain('clear badge image');
      spy.mockRestore();
    });
  });

  describe('addBadge', () => {
    test('rejects invalid input', async () => {
      const bad = { ...VALID_BADGE, name: 'a' } as any;
      await expect(addBadge(bad)).rejects.toThrow('Badge name must be at least 2 characters');
    });

    test('creates badge with requirements', async () => {
      const result = await addBadge(VALID_BADGE);
      expect(result.error).toBeNull();
      expect(memDb.badges).toHaveLength(1);
      expect(memDb.requirements).toHaveLength(1);
      expect(result.data?.conditions[0].requirement_attrb_value).toBe(5);
    });

    test('returns error when badge insert fails', async () => {
      supabaseConfig.failBadgeInsert = true;
      const result = await addBadge(VALID_BADGE);
      expect(result.error).toContain('Failed to add badge');
    });

    test('returns error when requirement insert fails', async () => {
      supabaseConfig.failRequirementInsert = true;
      const result = await addBadge(VALID_BADGE);
      expect(result.error).toContain('add badge requirements');
    });
  });

  describe('editBadge', () => {
    beforeEach(async () => {
      await addBadge(VALID_BADGE);
      supabaseConfig.failRequirementInsert = false;
    });

    test('updates badge and replaces requirements', async () => {
      const result = await editBadge('badge-1', EDIT_BADGE);
      expect(result.error).toBeNull();
      expect(result.data?.name).toBe('Consistency');
      expect(memDb.requirements[0].requirement_attrb_value).toBe(100);
    });

    test('returns error when update fails', async () => {
      supabaseConfig.failBadgeUpdate = true;
      const result = await editBadge('badge-1', EDIT_BADGE);
      expect(result.error).toContain('Failed to update badge');
    });

    test('returns error when requirement reinsertion fails', async () => {
      supabaseConfig.failRequirementInsert = true;
      const result = await editBadge('badge-1', EDIT_BADGE);
      expect(result.error).toContain('badge requirements');
    });
  });

  describe('deleteBadge', () => {
    beforeEach(async () => {
      await addBadge(VALID_BADGE);
    });

    test('removes badge and requirements', async () => {
      const result = await deleteBadge('badge-1');
      expect(result.error).toBeNull();
      expect(memDb.badges).toHaveLength(0);
      expect(memDb.requirements).toHaveLength(0);
    });

    test('returns error when delete fails', async () => {
      supabaseConfig.failBadgeDelete = true;
      const result = await deleteBadge('badge-1');
      expect(result.error).toContain('delete fail');
    });
  });
});

describe('Badge Editor Handlers (safeAction + toasts)', () => {
  beforeEach(() => resetState());

  test('handleFetchBadges returns data and no toast', async () => {
    await addBadge(VALID_BADGE);
    const data = await handleFetchBadges();
    expect(data).toHaveLength(1);
    expect(toastError).not.toHaveBeenCalled();
  });

  test('handleFetchBadges surfaces error', async () => {
    supabaseConfig.failBadgeQuery = true;
    const data = await handleFetchBadges();
    expect(data).toHaveLength(0);
    expect(toastError).toHaveBeenCalled();
  });

  test('handleAddBadge shows success toast', async () => {
    const result = await handleAddBadge(VALID_BADGE);
    expect(result?.name).toBe('Punctuality');
    expect(toastSuccess).toHaveBeenCalled();
  });

  test('handleAddBadge shows error toast on failure', async () => {
    supabaseConfig.failBadgeInsert = true;
    const result = await handleAddBadge(VALID_BADGE);
    expect(result).toBeNull();
    expect(toastError).toHaveBeenCalled();
  });

  test('handleEditBadge respects suppressToast', async () => {
    await addBadge(VALID_BADGE);
    const result = await handleEditBadge('badge-1', EDIT_BADGE, { suppressToast: true });
    expect(result?.name).toBe('Consistency');
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  test('handleDeleteBadge returns false on error', async () => {
    supabaseConfig.failBadgeDelete = true;
    const ok = await handleDeleteBadge('missing');
    expect(ok).toBe(false);
    expect(toastError).toHaveBeenCalled();
  });

  test('handleUploadBadgeImage returns url and invalidates cache flag via toast', async () => {
    memDb.badges.push({
      id: 'badge-1',
      name: 'Seed Badge',
      description: null,
      points: 10,
      award_at_interval: 'none',
      img_link: null,
      created_by: 'manager-1',
    });
    mockUpload.mockResolvedValueOnce({ data: { path: 'p' }, error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn/badges/badge-1/badge.png' } });
    const url = await handleUploadBadgeImage('badge-1', { size: 1000, type: 'image/png' } as any);
    expect(url).toContain('?t=1700000000000');
    expect(toastSuccess).toHaveBeenCalled();
  });

  test('handleUploadBadgeImage returns null on failure', async () => {
    mockUpload.mockResolvedValueOnce({ data: null, error: { message: 'upload fail' } });
    const url = await handleUploadBadgeImage('badge-1', { size: 1000, type: 'image/png' } as any);
    expect(url).toBeNull();
    expect(toastError).toHaveBeenCalled();
  });

  test('handleDeleteBadgeImage returns false on error', async () => {
    mockRemove.mockResolvedValueOnce({ data: null, error: { message: 'remove fail' } });
    const ok = await handleDeleteBadgeImage('badge-1');
    expect(ok).toBe(false);
    expect(toastError).toHaveBeenCalled();
  });
});

describe('Integration - in-memory badge lifecycle', () => {
  beforeEach(() => resetState());

  test('add -> list -> edit -> delete flow', async () => {
    const created = await handleAddBadge(VALID_BADGE);
    expect(created?.name).toBe('Punctuality');

    const listAfterAdd = await handleFetchBadges();
    expect(listAfterAdd).toHaveLength(1);

    await handleEditBadge('badge-1', EDIT_BADGE);
    const listAfterEdit = await handleFetchBadges();
    expect(listAfterEdit[0].name).toBe('Consistency');

    const deleted = await handleDeleteBadge('badge-1');
    expect(deleted).toBe(true);
    const finalList = await handleFetchBadges();
    expect(finalList).toHaveLength(0);
  });

  test('duplicate add prevented by zod validation differences', async () => {
    await handleAddBadge(VALID_BADGE);
    const result = await handleAddBadge({ ...VALID_BADGE, name: 'A' } as any);
    expect(result).toBeNull();
    expect(toastError).toHaveBeenCalled();
    const list = await handleFetchBadges();
    expect(list).toHaveLength(1);
  });
});