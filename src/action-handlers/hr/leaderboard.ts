import {
  generateRankingByPeriod,
  toggleRankingVisibility,
} from '@/actions/hr/leaderboard';
import { safeAction } from '@/lib/utils/safe-action';
import type { RankLogPeriodType, RankingLeaderboardViewRow } from '@/types';

export async function handleGenerateRankingByPeriodAction(
  periodType: RankLogPeriodType,
  year: number,
  month?: number,
  week?: number
): Promise<RankingLeaderboardViewRow[] | null> {
  const result = await safeAction(() =>
    generateRankingByPeriod(periodType, year, month, week)
  );

  if (!result.success || result.data?.error) {
    throw new Error(result.error || result.data?.error || 'Failed to generate ranking');
  }

  return result.data?.data ?? null;
}

export async function handleToggleRankingVisibilityAction(
  rankingPeriodId: string,
  isVisible: boolean
): Promise<{ id: string; is_visible: boolean }> {
  const result = await safeAction(() =>
    toggleRankingVisibility(rankingPeriodId, isVisible)
  );

  if (!result.success || result.data?.error || !result.data?.data) {
    throw new Error(
      result.error || result.data?.error || 'Failed to update ranking visibility'
    );
  }

  return result.data.data;
}