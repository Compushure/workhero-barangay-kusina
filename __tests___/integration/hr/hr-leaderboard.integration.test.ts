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
  toggleRankingVisibility,
} from '@/actions/hr/leaderboard';
import { getPeriodStartEnd, toManilaDateString } from '@/lib/utils/time-period-utils';
import { RemoteSupabaseTestContext } from '../../utils/remoteSupabaseTestUtils';
import {
  createHrLeaderboardSeedRows,
  hrLeaderboardIntegrationNames,
  hrLeaderboardIntegrationPeriodA,
  hrLeaderboardIntegrationPeriodB,
} from '../../mockData/hrLeaderboardMockData';

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
      namePrefix: hrLeaderboardIntegrationNames.hrReader.namePrefix,
      emailPrefix: hrLeaderboardIntegrationNames.hrReader.emailPrefix,
    });
    const employeeOne = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: hrLeaderboardIntegrationNames.employeeOne.namePrefix,
      emailPrefix: hrLeaderboardIntegrationNames.employeeOne.emailPrefix,
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const employeeTwo = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: hrLeaderboardIntegrationNames.employeeTwo.namePrefix,
      emailPrefix: hrLeaderboardIntegrationNames.employeeTwo.emailPrefix,
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });

    await seedWeeklyRanking({
      year: hrLeaderboardIntegrationPeriodA.year,
      week: hrLeaderboardIntegrationPeriodA.week,
      isVisible: true,
      rows: createHrLeaderboardSeedRows({
        firstUserId: employeeOne.id,
        secondUserId: employeeTwo.id,
        firstScore: hrLeaderboardIntegrationPeriodA.firstScore,
        secondScore: hrLeaderboardIntegrationPeriodA.secondScore,
      }),
    });

    currentServerClient = remoteContext.createServerClientForUser(hrUser);

    const existsResult = await checkRankingExists(
      'weekly',
      hrLeaderboardIntegrationPeriodA.year,
      undefined,
      hrLeaderboardIntegrationPeriodA.week
    );
    const enrichedResult = await getEnrichedLeaderboardByPeriod(
      'weekly',
      hrLeaderboardIntegrationPeriodA.year,
      undefined,
      hrLeaderboardIntegrationPeriodA.week
    );

    expect(existsResult.success).toBe(true);
    expect(existsResult.data).toBe(true);
    expect(enrichedResult.success).toBe(true);
    expect(enrichedResult.data?.players).toHaveLength(2);
    expect(enrichedResult.data?.players[0]).toEqual(
      expect.objectContaining({
        name: expect.stringContaining('HR Leaderboard Employee One'),
        rank: 1,
        taskPoints: hrLeaderboardIntegrationPeriodA.firstScore,
        badgePoints: 0,
        totalCompletedTasks: 0,
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
      namePrefix: hrLeaderboardIntegrationNames.hrHistory.namePrefix,
      emailPrefix: hrLeaderboardIntegrationNames.hrHistory.emailPrefix,
    });
    const employeeOne = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: hrLeaderboardIntegrationNames.historyEmployeeOne.namePrefix,
      emailPrefix: hrLeaderboardIntegrationNames.historyEmployeeOne.emailPrefix,
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const employeeTwo = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: hrLeaderboardIntegrationNames.historyEmployeeTwo.namePrefix,
      emailPrefix: hrLeaderboardIntegrationNames.historyEmployeeTwo.emailPrefix,
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });

    await seedWeeklyRanking({
      year: hrLeaderboardIntegrationPeriodB.year,
      week: hrLeaderboardIntegrationPeriodB.week,
      isVisible: false,
      rows: createHrLeaderboardSeedRows({
        firstUserId: employeeOne.id,
        secondUserId: employeeTwo.id,
        firstScore: hrLeaderboardIntegrationPeriodB.firstScore,
        secondScore: hrLeaderboardIntegrationPeriodB.secondScore,
      }),
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

describe('When HR validates and toggles seeded ranking periods', () => {
  test('Then checkRankingExists returns false when no ranking period was generated for the selected week', async () => {
    const hrUser = await remoteContext.seedUser({
      roleType: 'hr',
      namePrefix: 'HR Missing Ranking Check',
      emailPrefix: 'hr.missing.ranking.check',
    });

    currentServerClient = remoteContext.createServerClientForUser(hrUser);

    const existsResult = await checkRankingExists('weekly', 2098, undefined, 2);

    expect(existsResult.success).toBe(true);
    expect(existsResult.data).toBe(false);
  });

  test('Then checkRankingExists returns false when a ranking period exists without ranking entries', async () => {
    const hrUser = await remoteContext.seedUser({
      roleType: 'hr',
      namePrefix: 'HR Orphan Ranking Period',
      emailPrefix: 'hr.orphan.ranking.period',
    });

    const orphanYear = 2099;
    const orphanWeek = 6;
    const { start, end } = getPeriodStartEnd('weekly', orphanYear, undefined, orphanWeek);
    const orphanPeriodStart = toManilaDateString(start);
    const orphanPeriodEnd = toManilaDateString(end);

    const { data: orphanPeriod, error: orphanPeriodError } = await remoteContext.admin
      .from('RankingPeriod')
      .insert({
        period_type: 'weekly',
        period_start: orphanPeriodStart,
        period_end: orphanPeriodEnd,
        is_visible: false,
      })
      .select('id')
      .single();

    if (orphanPeriodError || !orphanPeriod?.id) {
      throw new Error(
        `Failed to seed orphan ranking period: ${orphanPeriodError?.message ?? 'Unknown error'}`
      );
    }

    createdRankingPeriodIds.push(orphanPeriod.id);

    currentServerClient = remoteContext.createServerClientForUser(hrUser);

    const existsResult = await checkRankingExists('weekly', orphanYear, undefined, orphanWeek);

    expect(existsResult.success).toBe(true);
    expect(existsResult.data).toBe(false);
  });

  test('Then toggleRankingVisibility updates seeded period visibility from hidden to visible', async () => {
    const hrUser = await remoteContext.seedUser({
      roleType: 'hr',
      namePrefix: 'HR Toggle Visibility',
      emailPrefix: 'hr.toggle.visibility',
    });
    const employeeOne = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'HR Toggle Employee One',
      emailPrefix: 'hr.toggle.employee.one',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const employeeTwo = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'HR Toggle Employee Two',
      emailPrefix: 'hr.toggle.employee.two',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });

    await seedWeeklyRanking({
      year: 2099,
      week: 5,
      isVisible: false,
      rows: createHrLeaderboardSeedRows({
        firstUserId: employeeOne.id,
        secondUserId: employeeTwo.id,
        firstScore: 330,
        secondScore: 320,
      }),
    });

    const { start } = getPeriodStartEnd('weekly', 2099, undefined, 5);
    const periodStart = toManilaDateString(start);
    const { data: rankingPeriod, error: rankingPeriodError } = await remoteContext.admin
      .from('RankingPeriod')
      .select('id, is_visible')
      .eq('period_type', 'weekly')
      .eq('period_start', periodStart)
      .single();

    if (rankingPeriodError || !rankingPeriod?.id) {
      throw new Error(
        `Failed to fetch seeded ranking period for visibility test: ${rankingPeriodError?.message ?? 'Unknown error'}`
      );
    }

    currentServerClient = remoteContext.createServerClientForUser(hrUser);

    const toggleResult = await toggleRankingVisibility(rankingPeriod.id, true);

    expect(toggleResult.success).toBe(true);
    expect(toggleResult.data).toEqual({ id: rankingPeriod.id, is_visible: true });

    const { data: updatedPeriod, error: updatedPeriodError } = await remoteContext.admin
      .from('RankingPeriod')
      .select('is_visible')
      .eq('id', rankingPeriod.id)
      .single();

    if (updatedPeriodError) {
      throw new Error(`Failed to fetch updated ranking period: ${updatedPeriodError.message}`);
    }

    expect(updatedPeriod?.is_visible).toBe(true);
  });
});

describe('When HR leaderboard actions run without an authenticated user', () => {
  test('Then getEnrichedLeaderboardByPeriod returns a failed action result with not-authenticated error', async () => {
    currentServerClient = remoteContext.createServerClientForUser(null);

    const result = await getEnrichedLeaderboardByPeriod(
      'weekly',
      hrLeaderboardIntegrationPeriodA.year,
      undefined,
      hrLeaderboardIntegrationPeriodA.week
    );

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
