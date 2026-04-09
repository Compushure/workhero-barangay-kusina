/**
 *  WARNING: MAKE SURE YOU HAVE THE RIGHT ENV FOR THE TEST DB DIOS MIOKO
 * Test coverage:
 * - Fetch enriched HR leaderboard rows for a seeded weekly period
 * - Check seeded ranking-period existence for HR generate flow
 * - Fetch HR past ranking periods with top performer and participant count
 * Run this file only: npm test -- --runTestsByPath __tests___/integration/hr/hr-leaderboard.integration.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import {
  checkRankingExists,
  getAllRankingPeriods,
  getEnrichedLeaderboardByPeriod,
} from '@/actions/hr/leaderboard';
import { getPeriodStartEnd, toManilaDateString } from '@/lib/utils/time-period-utils';
import { RemoteSupabaseTestContext } from '../../utils/remoteSupabaseTestUtils';

const remoteContext = new RemoteSupabaseTestContext('hr-leaderboard');
let currentServerClient: typeof remoteContext.admin = remoteContext.admin;
let currentAdminClient: typeof remoteContext.admin = remoteContext.admin;
let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;
const createdRankingPeriodIds: string[] = [];

jest.setTimeout(90000);

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => currentServerClient),
}));

jest.mock('@/lib/supabase/admin', () => ({
  get supabaseAdmin() {
    return currentAdminClient;
  },
}));

jest.mock('@/lib/utils/enrich-ranking', () => ({
  enrichRankingPlayers: jest.fn(
    async (
      rows: Array<{
        user_id: string;
        user_name: string;
        performance_score: number | null;
        completed_task_count: number | null;
        total_kpi_points: number | null;
        badge_points: number | null;
        rank: number | null;
      }>
    ) =>
      rows.map((row, index) => ({
        id: row.user_id,
        name: row.user_name,
        performanceScore: Number(row.performance_score ?? 0),
        totalCompletedTasks: Number(row.completed_task_count ?? 0),
        taskPoints: Number(row.total_kpi_points ?? 0),
        badgePoints: Number(row.badge_points ?? 0),
        image: null,
        badges: [],
        rank: Number(row.rank ?? index + 1),
      }))
  ),
}));

async function seedWeeklyRanking(args: {
  year: number;
  week: number;
  isVisible?: boolean;
  rows: Array<{
    userId: string;
    rank: number;
    performanceScore: number;
    totalKpiPoints?: number;
    badgePoints?: number;
    completedTaskCount?: number;
  }>;
}) {
  const { start, end } = getPeriodStartEnd('weekly', args.year, undefined, args.week);
  const periodStart = toManilaDateString(start);
  const periodEnd = toManilaDateString(end);

  const { data: period, error: periodError } = await remoteContext.admin
    .from('RankingPeriod')
    .insert({
      period_type: 'weekly',
      period_start: periodStart,
      period_end: periodEnd,
      is_visible: args.isVisible ?? true,
    })
    .select('id')
    .single();

  if (periodError || !period?.id) {
    throw new Error(`Failed to seed ranking period: ${periodError?.message ?? 'Unknown error'}`);
  }

  createdRankingPeriodIds.push(period.id);

  const entries = args.rows.map((row) => ({
    ranking_period_id: period.id,
    user_id: row.userId,
    rank: row.rank,
    performance_score: row.performanceScore,
    total_kpi_points: row.totalKpiPoints ?? row.performanceScore,
    badge_points: row.badgePoints ?? 0,
    completed_task_count: row.completedTaskCount ?? 0,
  }));

  const { error: entryError } = await remoteContext.admin.from('RankingEntry').insert(entries);

  if (entryError) {
    throw new Error(`Failed to seed ranking entries: ${entryError.message}`);
  }
}

beforeEach(() => {
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

describe('When HR reads enriched leaderboard data for a generated period', () => {
  test('Then getEnrichedLeaderboardByPeriod returns enriched players and period metadata', async () => {
    const hrUser = await remoteContext.seedUser({
      roleType: 'hr',
      namePrefix: 'HR Leaderboard Reader',
      emailPrefix: 'hr.leaderboard.reader',
    });
    const employeeOne = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'HR Leaderboard Employee One',
      emailPrefix: 'hr.leaderboard.employee.one',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const employeeTwo = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'HR Leaderboard Employee Two',
      emailPrefix: 'hr.leaderboard.employee.two',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });

    await seedWeeklyRanking({
      year: 2099,
      week: 3,
      isVisible: true,
      rows: [
        { userId: employeeOne.id, rank: 1, performanceScore: 420 },
        { userId: employeeTwo.id, rank: 2, performanceScore: 380 },
      ],
    });

    currentServerClient = remoteContext.createServerClientForUser(hrUser);

    const existsResult = await checkRankingExists('weekly', 2099, undefined, 3);
    const enrichedResult = await getEnrichedLeaderboardByPeriod('weekly', 2099, undefined, 3);

    expect(existsResult.success).toBe(true);
    expect(existsResult.data).toBe(true);
    expect(enrichedResult.success).toBe(true);
    expect(enrichedResult.data?.players).toHaveLength(2);
    expect(enrichedResult.data?.players[0]).toEqual(
      expect.objectContaining({
        name: expect.stringContaining('HR Leaderboard Employee One'),
        rank: 1,
      })
    );
    expect(enrichedResult.data?.isVisible).toBe(true);
    expect(enrichedResult.data?.periodLabel).toBe('Week');
  });
});

describe('When HR reads past ranking periods', () => {
  test('Then getAllRankingPeriods returns top performer and participant count for seeded period', async () => {
    const hrUser = await remoteContext.seedUser({
      roleType: 'hr',
      namePrefix: 'HR Leaderboard History',
      emailPrefix: 'hr.leaderboard.history',
    });
    const employeeOne = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'HR History Employee One',
      emailPrefix: 'hr.history.employee.one',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const employeeTwo = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'HR History Employee Two',
      emailPrefix: 'hr.history.employee.two',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });

    await seedWeeklyRanking({
      year: 2099,
      week: 4,
      isVisible: false,
      rows: [
        { userId: employeeOne.id, rank: 1, performanceScore: 510 },
        { userId: employeeTwo.id, rank: 2, performanceScore: 490 },
      ],
    });

    currentServerClient = remoteContext.createServerClientForUser(hrUser);

    const periodsResult = await getAllRankingPeriods();

    expect(periodsResult.success).toBe(true);
    expect(periodsResult.data?.length).toBeGreaterThan(0);
    expect(periodsResult.data?.[0]).toEqual(
      expect.objectContaining({
        top_performer_name: expect.stringContaining('HR History Employee One'),
        participant_count: 2,
      })
    );
  });
});

describe('When HR leaderboard actions run without an authenticated user', () => {
  test('Then getEnrichedLeaderboardByPeriod returns a failed action result with not-authenticated error', async () => {
    currentServerClient = remoteContext.createServerClientForUser(null);

    const result = await getEnrichedLeaderboardByPeriod('weekly', 2099, undefined, 3);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Not authenticated');
    expect(result.data).toBeNull();
  });

  test('Then getAllRankingPeriods returns a failed action result with not-authenticated error', async () => {
    currentServerClient = remoteContext.createServerClientForUser(null);

    const result = await getAllRankingPeriods();

    expect(result.success).toBe(false);
    expect(result.error).toContain('Not authenticated');
    expect(result.data).toBeNull();
  });
});
