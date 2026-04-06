/**
 * Test coverage:
 * - Fetch employee points and XP
 * - Fetch XP required for the next level
 * - Fetch level metadata
 * - Adjust active employee XP for level progression
 * - Verify the matching action handlers for each employee stats action
 * Run this file only: npm test -- --runTestsByPath __tests___/unit/employee/employee-stats.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  employeeStatsUserRowMockData,
  levelMetadataMockData,
} from '../../mockData/employeeStatsMockData';
import {
  adjustActiveUserXPByDelta,
  getAllLevelMetadata,
  getEmployeePoints,
  getEmployeeXP,
  getXPRequiredForNextLevel,
} from '@/actions/employee/stats';
import {
  handleAdjustActiveUserXPByDelta,
  handleFetchAllLevelMetadata,
  handleFetchEmployeePoints,
  handleFetchEmployeeXP,
  handleFetchXPRequiredForNextLevel,
} from '@/action-handlers/employee/stats';

type QueryError = { message: string } | null;
type SessionUser = { id: string; email: string };
type LevelRow = {
  level: number;
  xp: number | null;
  description?: string;
  bg_img_link?: string | null;
};
type UserStatsRow = {
  id: string;
  points: number | null;
  deducted_points: number | null;
  xp: number | null;
  level: number | null;
  total_xp: number | null;
};
type StatsState = {
  sessionUser: SessionUser | null;
  userRow: UserStatsRow | null;
  levelRows: LevelRow[];
  userSelectError?: QueryError;
  userUpdateError?: QueryError;
  levelSelectError?: QueryError;
};

let statsState: StatsState;
let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

const createClientMock = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/supabase/admin', () => ({
  get supabaseAdmin() {
    return createStatsAdminClient(statsState);
  },
}));

const { createClient } = jest.requireMock('@/lib/supabase/server') as {
  createClient: jest.MockedFunction<() => Promise<unknown>>;
};

const { toast } = jest.requireMock('sonner') as {
  toast: {
    success: jest.MockedFunction<(message?: unknown) => unknown>;
    error: jest.MockedFunction<(message?: unknown, options?: unknown) => unknown>;
  };
};

// Creates the user-table read and update chains used by the stats actions.
function createUserTableClient(state: StatsState) {
  return {
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(async () => {
          if (state.userSelectError) {
            return { data: null, error: state.userSelectError };
          }

          return { data: state.userRow, error: null };
        }),
      })),
    })),
    update: jest.fn((updates: Partial<UserStatsRow>) => ({
      eq: jest.fn(async () => {
        if (state.userUpdateError) {
          return { error: state.userUpdateError };
        }

        state.userRow = state.userRow
          ? {
              ...state.userRow,
              ...updates,
            }
          : state.userRow;

        return { error: null };
      }),
    })),
  };
}

// Creates the level-table read chains used for XP threshold calculations.
function createLevelTableClient(state: StatsState) {
  return {
    select: jest.fn(() => ({
      eq: jest.fn((_field: string, value: number) => ({
        single: jest.fn(async () => {
          if (state.levelSelectError) {
            return { data: null, error: state.levelSelectError };
          }

          const row = state.levelRows.find((levelRow) => levelRow.level === value) ?? null;
          return { data: row, error: row ? null : { message: 'Level data not found' } };
        }),
      })),
      order: jest.fn(async () => {
        if (state.levelSelectError) {
          return { data: null, error: state.levelSelectError };
        }

        return { data: state.levelRows, error: null };
      }),
    })),
  };
}

// Creates the mocked server client used for auth and Level-table reads.
function createStatsClient(state: StatsState) {
  return {
    auth: {
      getUser: jest.fn(async () => ({
        data: { user: state.sessionUser },
        error: null,
      })),
    },
    from: jest.fn((table: string) => {
      if (table === 'Level') {
        return createLevelTableClient(state);
      }

      throw new Error(`Unexpected table ${table}`);
    }),
  };
}

// Creates the mocked admin client used for direct User-table reads and writes.
function createStatsAdminClient(state: StatsState) {
  return {
    from: jest.fn((table: string) => {
      if (table === 'User') {
        return createUserTableClient(state);
      }

      throw new Error(`Unexpected admin table ${table}`);
    }),
  };
}

beforeEach(() => {
  // Reset the active employee stats fixture before each scenario.
  statsState = {
    sessionUser: { id: 'employee-1', email: 'employee.one@example.com' },
    userRow: { ...employeeStatsUserRowMockData },
    levelRows: [...levelMetadataMockData],
  };
  createClientMock.mockReset();
  createClientMock.mockImplementation(async () => createStatsClient(statsState));
  createClient.mockImplementation(async () => createStatsClient(statsState));
  toast.success.mockReset();
  toast.error.mockReset();
  // Hide expected safeAction logging in negative-path tests.
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

describe('When the employee reads points and XP data', () => {
  test('Then the getEmployeePoints action returns the current points and deducted points', async () => {
    const result = await getEmployeePoints();

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ points: 75, deductedPoints: 5 });
  });

  test('Then the getEmployeeXP action falls back to derived total XP when the stored total is missing', async () => {
    const result = await getEmployeeXP();

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      currentXP: 20,
      totalXP: 120,
      level: 2,
    });
  });

  test('Then the handleFetchEmployeePoints handler returns the points data without showing a toast', async () => {
    const result = await handleFetchEmployeePoints();

    expect(result).toEqual({ points: 75, deductedPoints: 5 });
    expect(toast.error).not.toHaveBeenCalled();
  });

  test('Then the handleFetchEmployeeXP handler returns null and shows an error toast when the action fails', async () => {
    statsState.userSelectError = { message: 'user xp query failed' };

    const result = await handleFetchEmployeeXP();

    expect(result).toBeNull();
    expect(toast.error).toHaveBeenCalledWith(
      'Failed to load XP',
      expect.objectContaining({
        description: expect.stringContaining('user xp query failed'),
      })
    );
  });
});

describe('When the employee reads level thresholds', () => {
  test('Then the getXPRequiredForNextLevel action returns zero at the level cap', async () => {
    const result = await getXPRequiredForNextLevel(10);

    expect(result.success).toBe(true);
    expect(result.data).toBe(0);
  });

  test('Then the getAllLevelMetadata action returns the fallback level list when the Level table is empty', async () => {
    statsState.levelRows = [];

    const result = await getAllLevelMetadata();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(10);
    expect(result.data?.[0]).toEqual(
      expect.objectContaining({
        level: 1,
        xp: 0,
      })
    );
  });

  test('Then the handlers return threshold and metadata data without showing error toasts on the happy path', async () => {
    const xpRequired = await handleFetchXPRequiredForNextLevel(2);
    const metadata = await handleFetchAllLevelMetadata();

    expect(xpRequired).toBe(100);
    expect(metadata).toHaveLength(10);
    expect(toast.error).not.toHaveBeenCalled();
  });
});

describe('When the employee adjusts active XP for level progression', () => {
  test('Then the adjustActiveUserXPByDelta action updates XP, total XP, and level using the level thresholds', async () => {
    const result = await adjustActiveUserXPByDelta(210);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      level: 3,
      xp: 130,
      totalXP: 330,
    });
    expect(statsState.userRow).toEqual(
      expect.objectContaining({
        level: 3,
        xp: 130,
        total_xp: 330,
      })
    );
  });

  test('Then the adjustActiveUserXPByDelta action floors total XP at zero when a large negative delta is applied', async () => {
    statsState.userRow = {
      ...employeeStatsUserRowMockData,
      xp: 40,
      level: 2,
      total_xp: 140,
    };

    const result = await adjustActiveUserXPByDelta(-500);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      level: 1,
      xp: 0,
      totalXP: 0,
    });
  });

  test('Then the handleAdjustActiveUserXPByDelta handler returns null and shows an error toast when the update fails', async () => {
    statsState.userUpdateError = { message: 'xp update failed' };

    const result = await handleAdjustActiveUserXPByDelta(50);

    expect(result).toBeNull();
    expect(toast.error).toHaveBeenCalledWith(
      'Failed to update XP',
      expect.objectContaining({
        description: expect.stringContaining('xp update failed'),
      })
    );
  });
});
