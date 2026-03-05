import { Calendar, BarChart2 } from 'lucide-react';
import { getRankingByPeriod } from '@/actions/hr/leaderboard';
import LeaderboardTable from '@/components/hr/leaderboard/leaderboard-table';
import VisibilityToggle from '@/components/hr/leaderboard/visibility-toggle';
import { enrichRankingPlayers } from '@/lib/utils/enrich-ranking';
import { getPeriodDateRangeSubtitle } from '@/lib/utils/time-period-utils';
import { createClient } from '@/lib/supabase/server';
import type { RankLogPeriodType, LeaderboardPlayer } from '@/types';

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

  const result = await getRankingByPeriod(
    periodType,
    year,
    periodType === 'monthly' ? month : undefined,
    periodType === 'weekly' ? week : undefined
  );

  const ranking = result.data ?? null;

  if (!ranking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-6 sm:py-8">
        <div className="flex flex-col items-center gap-4">
          <Calendar className="w-32 h-32 text-gray-400" />
          <p className="text-xl font-semibold text-gray-600">No Ranking for this period</p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const enrichedPlayers: (LeaderboardPlayer & { rank: number })[] = await enrichRankingPlayers(
    ranking,
    supabase
  );

  const displayPeriodLabel =
    periodType === 'weekly' ? ranking.period_label.replace(/,\s*\d{4}$/, '') : ranking.period_label;

  // Limit to top 10 players
  const top10Players = enrichedPlayers.slice(0, 10);

  return (
    <div className="mb-2">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between max-w-6xl mx-auto">
        <div>
          <h2 className="text-xl font-bold text-[#6D1616]">{displayPeriodLabel}</h2>
          {getPeriodDateRangeSubtitle(ranking) && (
            <p className="text-sm text-gray-600 mt-0.5">{getPeriodDateRangeSubtitle(ranking)}</p>
          )}
        </div>

        <VisibilityToggle rankLogId={ranking.id} isVisible={ranking.is_visible} />
      </div>

      <LeaderboardTable players={top10Players} />
    </div>
  );
}
