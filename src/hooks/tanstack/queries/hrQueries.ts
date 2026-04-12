'use client';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import {
  getEnrichedLeaderboardByPeriod,
  type EnrichedLeaderboardResult,
} from '@/actions/hr/leaderboard';
import type { RankLogPeriodType } from '@/types';

export const hrLeaderboardKeys = {
  all: ['hr', 'leaderboard'] as const,
  byPeriod: (
    periodType: RankLogPeriodType,
    year: number,
    week?: number,
    month?: number
  ) => [...hrLeaderboardKeys.all, periodType, year, week, month] as const,
};

export function useLeaderboardRankingQuery(params: {
  periodType: RankLogPeriodType;
  year: number;
  week: number;
  month: number;
  show: boolean;
}): UseQueryResult<EnrichedLeaderboardResult | null, Error> {
  const { periodType, year, week, month, show } = params;

  return useQuery({
    queryKey: hrLeaderboardKeys.byPeriod(
      periodType,
      year,
      periodType === 'weekly' ? week : undefined,
      periodType === 'monthly' ? month : undefined
    ),
    queryFn: async () => {
      const result = await getEnrichedLeaderboardByPeriod(
        periodType,
        year,
        periodType === 'monthly' ? month : undefined,
        periodType === 'weekly' ? week : undefined
      );
      if (!result.success) throw new Error(result.error);
      return result.data ?? null;
    },
    enabled: show,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  }) as UseQueryResult<EnrichedLeaderboardResult | null, Error>;
}
