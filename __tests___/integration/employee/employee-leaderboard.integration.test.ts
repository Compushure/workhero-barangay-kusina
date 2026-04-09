/**
 *  WARNING: MAKE SURE YOU HAVE THE RIGHT ENV FOR THE TEST DB DIOS MIOKO
 * Test coverage:
 * - Fetch remote employee top ranks by period from seeded ranking data
 * - Fetch remote employee rank snapshot from latest visible weekly period
 * - Verify unauthenticated leaderboard handler behavior with toast feedback
 * Run this file only: npm test -- --runTestsByPath __tests___/integration/employee/employee-leaderboard.integration.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  handleFetchEmployeeRank,
  handleFetchEmployeeTopRanksByPeriod,
} from '@/action-handlers/employee/stats';
import { getPeriodStartEnd, toManilaDateString } from '@/lib/utils/time-period-utils';
import { RemoteSupabaseTestContext } from '../../utils/remoteSupabaseTestUtils';
import {
  employeeLeaderboardIntegrationNames,
  employeeLeaderboardIntegrationPeriodA,
  employeeLeaderboardIntegrationPeriodB,
} from '../../mockData/employeeLeaderboardMockData';

const remoteContext = new RemoteSupabaseTestContext('employee-leaderboard');
let currentServerClient: typeof remoteContext.admin = remoteContext.admin;
const createdRankingPeriodIds: string[] = [];
let currentAdminClient: typeof remoteContext.admin = remoteContext.admin;
let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

jest.setTimeout(90000);

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => currentServerClient),
}));

jest.mock('@/lib/supabase/admin', () => ({
  get supabaseAdmin() {
    return currentAdminClient;
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const { toast } = jest.requireMock('sonner') as {
  toast: {
    success: jest.MockedFunction<(message?: unknown) => unknown>;
    error: jest.MockedFunction<(message?: unknown, options?: unknown) => unknown>;
  };
};

async function seedWeeklyRanking(args: {
  year: number;
  week: number;
  rows: Array<{
    userId: string;
    rank: number;
    performanceScore: number;
    taskPoints?: number;
    badgePoints?: number;
    completedTaskCount?: number;
  }>;
  isVisible?: boolean;
}) {
  const { start, end } = getPeriodStartEnd('weekly', args.year, undefined, args.week);
  const periodStart = toManilaDateString(start);
  const periodEnd = toManilaDateString(end);

  const { data: periodRow, error: periodError } = await remoteContext.admin
    .from('RankingPeriod')
    .insert({
      period_type: 'weekly',
      period_start: periodStart,
      period_end: periodEnd,
      is_visible: args.isVisible ?? true,
    })
    .select('id')
    .single();

  if (periodError || !periodRow?.id) {
    throw new Error(`Failed to seed ranking period: ${periodError?.message ?? 'Unknown error'}`);
  }

  createdRankingPeriodIds.push(periodRow.id);

  const entriesPayload = args.rows.map((row) => ({
    ranking_period_id: periodRow.id,
    user_id: row.userId,
    rank: row.rank,
    performance_score: row.performanceScore,
    total_kpi_points: row.taskPoints ?? row.performanceScore,
    badge_points: row.badgePoints ?? 0,
    completed_task_count: row.completedTaskCount ?? 0,
  }));

  const { error: entriesError } = await remoteContext.admin
    .from('RankingEntry')
    .insert(entriesPayload);

  if (entriesError) {
    throw new Error(`Failed to seed ranking entries: ${entriesError.message}`);
  }
}

beforeEach(() => {
  toast.success.mockReset();
  toast.error.mockReset();
  currentServerClient = remoteContext.admin;
  currentAdminClient = remoteContext.admin;
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(async () => {
  consoleErrorSpy.mockRestore();

  if (createdRankingPeriodIds.length) {
    const periodIds = [...createdRankingPeriodIds];
    createdRankingPeriodIds.length = 0;

    await remoteContext.admin.from('RankingEntry').delete().in('ranking_period_id', periodIds);

    await remoteContext.admin.from('RankingPeriod').delete().in('id', periodIds);
  }

  await remoteContext.cleanup();
});

describe('When the employee reads remote leaderboard period entries', () => {
  test('Then the top ranks by period handler returns seeded ranking rows with current-user mapping', async () => {
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: employeeLeaderboardIntegrationNames.employee.namePrefix,
      emailPrefix: employeeLeaderboardIntegrationNames.employee.emailPrefix,
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const competitor = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: employeeLeaderboardIntegrationNames.competitor.namePrefix,
      emailPrefix: employeeLeaderboardIntegrationNames.competitor.emailPrefix,
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });

    await seedWeeklyRanking({
      year: employeeLeaderboardIntegrationPeriodA.year,
      week: employeeLeaderboardIntegrationPeriodA.week,
      rows: [
        {
          userId: competitor.id,
          rank: 1,
          performanceScore: employeeLeaderboardIntegrationPeriodA.firstScore,
        },
        {
          userId: employee.id,
          rank: 2,
          performanceScore: employeeLeaderboardIntegrationPeriodA.secondScore,
        },
      ],
      isVisible: true,
    });

    currentServerClient = remoteContext.createServerClientForUser(employee);

    const rows = await handleFetchEmployeeTopRanksByPeriod({
      periodType: 'weekly',
      year: employeeLeaderboardIntegrationPeriodA.year,
      week: employeeLeaderboardIntegrationPeriodA.week,
    });

    expect(rows).toHaveLength(2);
    expect(rows?.[0]).toEqual(
      expect.objectContaining({
        rank: 1,
        userId: competitor.id,
        isCurrentUser: false,
      })
    );
    expect(rows?.[1]).toEqual(
      expect.objectContaining({
        rank: 2,
        userId: employee.id,
        isCurrentUser: true,
      })
    );
    expect(toast.error).not.toHaveBeenCalled();
  });
});

describe('When the employee reads the latest remote rank snapshot', () => {
  test('Then the rank handler returns the current employee rank from the latest visible weekly period', async () => {
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: employeeLeaderboardIntegrationNames.rankEmployee.namePrefix,
      emailPrefix: employeeLeaderboardIntegrationNames.rankEmployee.emailPrefix,
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const competitor = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: employeeLeaderboardIntegrationNames.rankCompetitor.namePrefix,
      emailPrefix: employeeLeaderboardIntegrationNames.rankCompetitor.emailPrefix,
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });

    await seedWeeklyRanking({
      year: employeeLeaderboardIntegrationPeriodB.year,
      week: employeeLeaderboardIntegrationPeriodB.week,
      rows: [
        {
          userId: competitor.id,
          rank: 1,
          performanceScore: employeeLeaderboardIntegrationPeriodB.firstScore,
        },
        {
          userId: employee.id,
          rank: 2,
          performanceScore: employeeLeaderboardIntegrationPeriodB.secondScore,
        },
      ],
      isVisible: true,
    });

    currentServerClient = remoteContext.createServerClientForUser(employee);

    const rank = await handleFetchEmployeeRank();

    expect(rank).toEqual({
      rank: 2,
      performanceScore: 450,
      totalEmployees: 2,
    });
    expect(toast.error).not.toHaveBeenCalled();
  });
});

describe('When leaderboard handlers run without an authenticated employee', () => {
  test('Then the top ranks by period handler returns null and shows an error toast', async () => {
    currentServerClient = remoteContext.createServerClientForUser(null);

    const rows = await handleFetchEmployeeTopRanksByPeriod({
      periodType: 'weekly',
      year: employeeLeaderboardIntegrationPeriodA.year,
      week: employeeLeaderboardIntegrationPeriodA.week,
    });

    expect(rows).toBeNull();
    expect(toast.error).toHaveBeenCalledWith(
      'Failed to load rankings for selected period',
      expect.objectContaining({
        description: expect.stringContaining('User not authenticated'),
      })
    );
  });
});
