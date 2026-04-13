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
import {
  hrLeaderboardUnitGeneratedRows,
  hrLeaderboardUnitSelection,
} from '../../mockData/hrLeaderboardMockData';

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
const safeActionMock: jest.MockedFunction<(...args: unknown[]) => Promise<ActionResult<unknown>>> =
  jest.fn();

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
    const rows: RankingLeaderboardViewRow[] = hrLeaderboardUnitGeneratedRows;

    generateRankingByPeriodMock.mockResolvedValue({
      success: true,
      data: rows,
      error: null,
    });

    const result = await handleGenerateRankingByPeriodAction(
      hrLeaderboardUnitSelection.periodType,
      hrLeaderboardUnitSelection.year,
      undefined,
      hrLeaderboardUnitSelection.week
    );

    expect(result).toEqual(rows);
    expect(generateRankingByPeriodMock).toHaveBeenCalledWith(
      hrLeaderboardUnitSelection.periodType,
      hrLeaderboardUnitSelection.year,
      undefined,
      hrLeaderboardUnitSelection.week
    );
  });

  test('Then the generate handler throws when the wrapped server action result contains an error', async () => {
    generateRankingByPeriodMock.mockResolvedValue({
      success: false,
      data: null,
      error: 'Not authenticated',
    });

    await expect(
      handleGenerateRankingByPeriodAction(
        hrLeaderboardUnitSelection.periodType,
        hrLeaderboardUnitSelection.year,
        undefined,
        hrLeaderboardUnitSelection.week
      )
    ).rejects.toThrow('Not authenticated');
  });

  test('Then the generate handler throws when safeAction fails before returning nested action data', async () => {
    safeActionMock.mockResolvedValueOnce({
      success: false,
      data: null,
      error: 'Safe action wrapper failed',
    });

    await expect(
      handleGenerateRankingByPeriodAction(
        hrLeaderboardUnitSelection.periodType,
        hrLeaderboardUnitSelection.year,
        undefined,
        hrLeaderboardUnitSelection.week
      )
    ).rejects.toThrow('Safe action wrapper failed');
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

  test('Then the visibility handler throws when the wrapped action result contains an explicit error', async () => {
    toggleRankingVisibilityMock.mockResolvedValue({
      success: false,
      data: null,
      error: 'Not authenticated',
    });

    await expect(handleToggleRankingVisibilityAction('period-1', true)).rejects.toThrow(
      'Not authenticated'
    );
  });
});
