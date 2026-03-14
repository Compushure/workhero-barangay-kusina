'use client';

import { Trophy } from 'lucide-react';
import LeaderboardTable from '@/components/hr/leaderboard/leaderboard-table';
import LeaderboardTableSkeleton from '@/components/hr/leaderboard/leaderboard-table-skeleton';
import { buildPeriodLabel } from '@/lib/utils/time-period-utils';
import { useLeaderboardRankingQuery } from '@/hooks/tanstack/queries/hrQueries';
import type { RankLogPeriodType } from '@/types';

interface LeaderboardContentProps {
  periodType: RankLogPeriodType;
  year: number;
  week: number;
  month: number;
  show: boolean;
}

export function LeaderboardContent({
  periodType,
  year,
  week,
  month,
  show,
}: LeaderboardContentProps) {
  const { data, isPending, isFetching } = useLeaderboardRankingQuery({
    periodType,
    year,
    week,
    month,
    show,
  });

  // Show skeleton during initial load OR background refetch when there's no data yet
  if ((isPending || isFetching) && !data) {
    return <LeaderboardTableSkeleton />;
  }

  // No ranking data for this period
  if (!data) {
    const emptyStatePeriodLabel = buildPeriodLabel(
      periodType,
      year,
      periodType === 'monthly' ? month : undefined,
      periodType === 'weekly' ? week : undefined
    );
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-6 sm:py-8">
        <div className="flex flex-col items-center gap-4 rounded-2xl px-16 py-14 text-center max-w-md">
          <div className="rounded-full bg-gray-100 p-4">
            <Trophy className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No Ranking Available</h3>
          <p className="text-sm text-muted-foreground">
            The ranking for{' '}
            <span className="font-semibold text-foreground">{emptyStatePeriodLabel}</span> has not
            been generated yet. Click the generate button above to create it.
          </p>
        </div>
      </div>
    );
  }

  // Render table — kept visible while a background fetch is in progress (isFetching)
  return (
    <div className="mb-2 w-full">
      <LeaderboardTable
        players={data.players}
        periodLabel={data.periodLabel}
        dateRangeSubtitle={data.dateRangeSubtitle}
        rankingPeriodId={data.rankingPeriodId}
        isVisible={data.isVisible}
      />
    </div>
  );
}
