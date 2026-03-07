import { BarChart2, Trophy } from 'lucide-react';
import { getRankingByPeriod } from '@/actions/hr/leaderboard';
import LeaderboardTable from '@/components/hr/leaderboard/leaderboard-table';
import VisibilityToggle from '@/components/hr/leaderboard/visibility-toggle';
import { enrichRankingPlayers } from '@/lib/utils/enrich-ranking';
import { getPeriodDateRangeSubtitle } from '@/lib/utils/time-period-utils';
import { createClient } from '@/lib/supabase/server';
import type { RankLogPeriodType, LeaderboardPlayer, RankingLeaderboardViewRow } from '@/types';

interface LeaderboardContentProps {
  periodType: RankLogPeriodType;
  year: number;
  week: number;
  month: number;
  show: boolean;
}

export async function LeaderboardContent({
  periodType,
  year,
  week,
  month,
  show,
}: LeaderboardContentProps) {
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

  const rankingResult = await getRankingByPeriod(
    periodType,
    year,
    periodType === 'monthly' ? month : undefined,
    periodType === 'weekly' ? week : undefined
  );

  const rows: RankingLeaderboardViewRow[] | null = rankingResult.data ?? null;

  if (!rows || rows.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-6 sm:py-8">
        <div className="flex flex-col items-center gap-4 rounded-2xl px-16 py-14 text-center">
          <Trophy className="w-32 h-32 text-gray-600" />
          <p className="text-lg font-semibold text-gray-600">No Rankings for this period</p>
        </div>
      </div>
    );
  }

  const periodInfo = rows[0];

  const supabase = await createClient();
  const enrichedPlayers: (LeaderboardPlayer & { rank: number })[] = await enrichRankingPlayers(
    rows,
    supabase
  );

  const displayPeriodLabel =
    periodType === 'weekly'
      ? periodInfo.period_label.replace(/,\s*\d{4}$/, '')
      : periodInfo.period_label;

  return (
    <div className="mb-2 w-full">
      <div className="mb-2 flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground ">{displayPeriodLabel}</h2>
          {getPeriodDateRangeSubtitle(periodInfo) && (
            <p className="text-sm text-gray-600 mt-0.5">{getPeriodDateRangeSubtitle(periodInfo)}</p>
          )}
        </div>

        <VisibilityToggle
          rankingPeriodId={periodInfo.ranking_period_id}
          isVisible={periodInfo.is_visible}
        />
      </div>

      <LeaderboardTable players={enrichedPlayers} />
    </div>
  );
}
