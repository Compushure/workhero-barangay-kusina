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
      <div className="flex min-h-[52vh] items-center justify-center py-5 sm:py-7">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-accent/20 bg-card px-8 py-10 text-center shadow-sm/40">
          <div className="rounded-full bg-primary/10 p-3.5 text-primary">
            <Trophy className="h-14 w-14" />
          </div>
          <h3 className="text-h3 text-foreground">No Ranking Available</h3>
          <p className="text-meta text-muted-foreground">
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
    <div className="w-full">
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
