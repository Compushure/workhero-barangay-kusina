'use client';

import { BarChart2, Trophy } from 'lucide-react';
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

  if (!show) {
    return (
      <div className="flex justify-center py-8 sm:py-12">
        <div className="w-full max-w-2xl bg-[#FBF4E8] rounded-2xl border border-[#E9C496] shadow-md overflow-hidden">
          <div className="bg-linear-to-r from-[#EBCBA8] to-[#E9C496] px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-[#6D1616]" />
            </div>
            <h3 className="text-xl font-bold text-[#6D1616]">Select a Period</h3>
          </div>
          <div className="px-6 py-6">
            <p className="text-[#5a2a2a] text-base">
              Choose a period type, year, and week/month above, then click{' '}
              <span className="font-semibold">Show Rankings</span> to view the leaderboard for that
              period.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
