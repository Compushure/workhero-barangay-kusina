/**
 * Test coverage:
 * - Generate ranking action handler success and error paths
 * - Toggle ranking visibility action handler success and error paths
 * Run this file only: npm test -- --runTestsByPath __tests___/unit/hr/hr-leaderboard.test.ts
 */

import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import {
  handleGenerateRankingByPeriodAction,
  handleToggleRankingVisibilityAction,
} from '@/action-handlers/hr/leaderboard';
import type { RankLogPeriodType, RankingLeaderboardViewRow } from '@/types';

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };

type GenerateRankingAction = (
  periodType: RankLogPeriodType,
  year: number,
  month?: number,
  week?: number
) => Promise<ActionResult<RankingLeaderboardViewRow[] | null>>;

type ToggleVisibilityAction = (
  rankingPeriodId: string,
  isVisible: boolean
) => Promise<ActionResult<{ id: string; is_visible: boolean } | null>>;

const generateRankingByPeriodMock: jest.MockedFunction<GenerateRankingAction> = jest.fn();
const toggleRankingVisibilityMock: jest.MockedFunction<ToggleVisibilityAction> = jest.fn();
const safeActionMock = jest.fn();

jest.mock('@/actions/hr/leaderboard', () => ({
  generateRankingByPeriod: (
    periodType: RankLogPeriodType,
    year: number,
    month?: number,
    week?: number
  ) => generateRankingByPeriodMock(periodType, year, month, week),
  toggleRankingVisibility: (rankingPeriodId: string, isVisible: boolean) =>
    toggleRankingVisibilityMock(rankingPeriodId, isVisible),
}));

jest.mock('@/lib/utils/safe-action', () => ({
  safeAction: (...args: unknown[]) => safeActionMock(...args),
}));

beforeEach(() => {
  generateRankingByPeriodMock.mockReset();
  toggleRankingVisibilityMock.mockReset();
  safeActionMock.mockReset();

  safeActionMock.mockImplementation(async (...args: unknown[]) => {
    const fn = args[0] as () => Promise<unknown>;
    try {
      const data = await fn();
      return { success: true, data, error: null } satisfies ActionResult<unknown>;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      } satisfies ActionResult<null>;
    }
  });
});

describe('When HR generates leaderboard rankings through the action handler', () => {
  test('Then the generate handler returns rows when the wrapped server action succeeds', async () => {
    const rows: RankingLeaderboardViewRow[] = [
      {
        ranking_period_id: 'period-1',
        period_type: 'weekly',
        period_start: '2026-03-30',
        period_end: '2026-04-05',
        is_visible: false,
        generated_at: '2026-04-06T00:00:00.000Z',
        period_label: 'Week 14, 2026',
        entry_id: 'entry-1',
        user_id: 'employee-1',
        user_name: 'Employee One',
        rank: 1,
        performance_score: 300,
        total_kpi_points: 260,
        badge_points: 40,
        completed_task_count: 12,
      },
    ];

    generateRankingByPeriodMock.mockResolvedValue({
      success: true,
      data: rows,
      error: null,
    });

    const result = await handleGenerateRankingByPeriodAction(
      'weekly' as RankLogPeriodType,
      2026,
      undefined,
      14
    );

    expect(result).toEqual(rows);
    expect(generateRankingByPeriodMock).toHaveBeenCalledWith('weekly', 2026, undefined, 14);
  });

  test('Then the generate handler throws when the wrapped server action result contains an error', async () => {
    generateRankingByPeriodMock.mockResolvedValue({
      success: false,
      data: null,
      error: 'Not authenticated',
    });

    await expect(
      handleGenerateRankingByPeriodAction('weekly' as RankLogPeriodType, 2026, undefined, 14)
    ).rejects.toThrow('Not authenticated');
  });
});

describe('When HR toggles leaderboard visibility through the action handler', () => {
  test('Then the visibility handler returns the updated row when the wrapped action succeeds', async () => {
    toggleRankingVisibilityMock.mockResolvedValue({
      success: true,
      data: { id: 'period-1', is_visible: true },
      error: null,
    });

    const result = await handleToggleRankingVisibilityAction('period-1', true);

    expect(result).toEqual({ id: 'period-1', is_visible: true });
    expect(toggleRankingVisibilityMock).toHaveBeenCalledWith('period-1', true);
  });

  test('Then the visibility handler throws when the wrapped action returns missing data', async () => {
    toggleRankingVisibilityMock.mockResolvedValue({
      success: true,
      data: null,
      error: null,
    });

    await expect(handleToggleRankingVisibilityAction('period-1', false)).rejects.toThrow(
      'Failed to update ranking visibility'
    );
  });
});
