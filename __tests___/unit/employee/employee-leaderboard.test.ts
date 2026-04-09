/**
 * Test coverage:
 * - Fetch employee leaderboard rank snapshot
 * - Fetch employee top weekly leaderboard entries
 * - Fetch employee top leaderboard entries by period
 * - Verify matching employee leaderboard action handlers and toast behavior
 * Run this file only: npm test -- --runTestsByPath __tests___/unit/employee/employee-leaderboard.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  getEmployeeRank,
  getEmployeeTopRanksByPeriod,
  getEmployeeTopWeeklyRanks,
} from '@/actions/employee/stats';
import {
  handleFetchEmployeeRank,
  handleFetchEmployeeTopRanksByPeriod,
  handleFetchEmployeeTopWeeklyRanks,
} from '@/action-handlers/employee/stats';

type QueryError = { message: string } | null;
type SessionUser = { id: string; email: string };
type RankingPeriodRow = { id: string; period_start: string; is_visible: boolean } | null;
type RankingEntryRow = { user_id: string; rank: number; performance_score: number | null };
type LeaderboardViewRow = {
  user_id: string;
  user_name: string;
  rank: number;
  performance_score: number | null;
};

type LeaderboardState = {
  sessionUser: SessionUser | null;
  latestPeriod: RankingPeriodRow;
  rankingEntries: RankingEntryRow[];
  leaderboardRows: LeaderboardViewRow[];
  rankingPeriodError?: QueryError;
  rankingEntriesError?: QueryError;
  leaderboardRowsError?: QueryError;
};

let leaderboardState: LeaderboardState;
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
    return createLeaderboardAdminClient(leaderboardState);
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

// Creates the RankingPeriod query chain used by both weekly and rank snapshot fetches.
function createRankingPeriodQuery(state: LeaderboardState) {
  return {
    select: jest.fn(() => {
      const query = {
        eq: jest.fn(() => query),
        order: jest.fn(() => query),
        limit: jest.fn(() => query),
        maybeSingle: jest.fn(async () => {
          if (state.rankingPeriodError) {
            return { data: null, error: state.rankingPeriodError };
          }

          return {
            data: state.latestPeriod,
            error: null,
          };
        }),
      };

      return query;
    }),
  };
}

// Creates the RankingEntry table chain used to derive rank and population counts.
function createRankingEntryQuery(state: LeaderboardState) {
  return {
    select: jest.fn(() => ({
      eq: jest.fn(async () => {
        if (state.rankingEntriesError) {
          return { data: null, error: state.rankingEntriesError };
        }

        return {
          data: state.rankingEntries,
          error: null,
        };
      }),
    })),
  };
}

// Creates the ranking_leaderboard_view chain used for top 10 leaderboard reads.
function createLeaderboardViewQuery(state: LeaderboardState) {
  return {
    select: jest.fn(() => {
      const query = {
        eq: jest.fn(() => query),
        order: jest.fn(() => query),
        limit: jest.fn(async () => {
          if (state.leaderboardRowsError) {
            return { data: null, error: state.leaderboardRowsError };
          }

          return {
            data: state.leaderboardRows,
            error: null,
          };
        }),
      };

      return query;
    }),
  };
}

// Creates the mocked server client for auth lookups in employee leaderboard actions.
function createLeaderboardClient(state: LeaderboardState) {
  return {
    auth: {
      getUser: jest.fn(async () => ({
        data: { user: state.sessionUser },
        error: null,
      })),
    },
  };
}

// Creates the mocked admin client for leaderboard reads and profile image URLs.
function createLeaderboardAdminClient(state: LeaderboardState) {
  return {
    from: jest.fn((table: string) => {
      if (table === 'RankingPeriod') {
        return createRankingPeriodQuery(state);
      }

      if (table === 'RankingEntry') {
        return createRankingEntryQuery(state);
      }

      if (table === 'ranking_leaderboard_view') {
        return createLeaderboardViewQuery(state);
      }

      throw new Error(`Unexpected admin table ${table}`);
    }),
    storage: {
      from: jest.fn(() => ({
        getPublicUrl: jest.fn((path: string) => ({
          data: { publicUrl: `https://cdn.example.com/${path}` },
        })),
      })),
    },
  };
}

beforeEach(() => {
  leaderboardState = {
    sessionUser: { id: 'employee-1', email: 'employee.one@example.com' },
    latestPeriod: {
      id: 'period-weekly-2026-14',
      period_start: '2026-03-30',
      is_visible: true,
    },
    rankingEntries: [
      { user_id: 'employee-2', rank: 1, performance_score: 220 },
      { user_id: 'employee-1', rank: 2, performance_score: 180 },
      { user_id: 'employee-3', rank: 3, performance_score: 160 },
    ],
    leaderboardRows: [
      { user_id: 'employee-2', user_name: 'Employee Two', rank: 1, performance_score: 220 },
      { user_id: 'employee-1', user_name: 'Employee One', rank: 2, performance_score: 180 },
      { user_id: 'employee-3', user_name: 'Employee Three', rank: 3, performance_score: 160 },
    ],
  };

  createClientMock.mockReset();
  createClientMock.mockImplementation(async () => createLeaderboardClient(leaderboardState));
  createClient.mockImplementation(async () => createLeaderboardClient(leaderboardState));

  toast.success.mockReset();
  toast.error.mockReset();

  // Hide expected safeAction logging in negative-path tests.
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

describe('When the employee reads leaderboard snapshots', () => {
  test('Then the getEmployeeRank action returns rank, performance score, and total employees', async () => {
    const result = await getEmployeeRank();

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      rank: 2,
      performanceScore: 180,
      totalEmployees: 3,
    });
  });

  test('Then the getEmployeeTopWeeklyRanks action returns mapped top entries with profile URLs', async () => {
    const result = await getEmployeeTopWeeklyRanks();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(3);
    expect(result.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rank: 1,
          userId: 'employee-2',
          name: 'Employee Two',
          performanceScore: 220,
          isCurrentUser: false,
          profilePictureUrl: 'https://cdn.example.com/employee-2/profile.png',
        }),
        expect.objectContaining({
          rank: 2,
          userId: 'employee-1',
          name: 'Employee One',
          performanceScore: 180,
          isCurrentUser: true,
          profilePictureUrl: 'https://cdn.example.com/employee-1/profile.png',
        }),
      ])
    );
  });

  test('Then the getEmployeeTopRanksByPeriod action returns null when no visible rows exist for the period', async () => {
    leaderboardState.leaderboardRows = [];

    const result = await getEmployeeTopRanksByPeriod('monthly', 2026, 3);

    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });
});

describe('When employee leaderboard handlers process action responses', () => {
  test('Then the leaderboard handlers return data without showing error toasts on the happy path', async () => {
    const rank = await handleFetchEmployeeRank();
    const weeklyTop = await handleFetchEmployeeTopWeeklyRanks();
    const byPeriodTop = await handleFetchEmployeeTopRanksByPeriod({
      periodType: 'weekly',
      year: 2026,
      week: 14,
    });

    expect(rank).toEqual({ rank: 2, performanceScore: 180, totalEmployees: 3 });
    expect(weeklyTop).toHaveLength(3);
    expect(byPeriodTop).toHaveLength(3);
    expect(toast.error).not.toHaveBeenCalled();
  });

  test('Then the period leaderboard handler returns null and shows an error toast when the user is unauthenticated', async () => {
    leaderboardState.sessionUser = null;

    const result = await handleFetchEmployeeTopRanksByPeriod({
      periodType: 'weekly',
      year: 2026,
      week: 14,
    });

    expect(result).toBeNull();
    expect(toast.error).toHaveBeenCalledWith(
      'Failed to load rankings for selected period',
      expect.objectContaining({
        description: expect.stringContaining('User not authenticated'),
      })
    );
  });
});
