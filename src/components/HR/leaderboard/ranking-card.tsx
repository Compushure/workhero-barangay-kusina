import Link from 'next/link';
import { Award, Calendar, Clock, Eye, User } from 'lucide-react';
import VisibilityToggle from '@/components/hr/leaderboard/visibility-toggle';
import { getPeriodDateRangeSubtitle } from '@/lib/utils/time-period-utils';
import type { RankLogPeriodType, RankLogRow } from '@/types';

interface RankingCardProps {
  ranking: RankLogRow;
  periodType: RankLogPeriodType;
  isLatest: boolean;
}

export function RankingCard({ ranking, periodType, isLatest }: RankingCardProps) {
  const dateRangeSubtitle = getPeriodDateRangeSubtitle(ranking);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between px-4 sm:px-6 py-6 sm:py-8">
        <Link
          href={`/hr/leaderboard?type=${periodType}&id=${ranking.id}`}
          className="flex-1 min-w-0"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-[#FEF3C7] rounded-full flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-[#F59E0B]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900">{ranking.period_label}</h3>
                {dateRangeSubtitle && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                    <Calendar className="w-3 h-3 shrink-0" />
                    {dateRangeSubtitle}
                  </span>
                )}
                {isLatest && (
                  <span className="inline-flex items-center rounded-full bg-[#6D1616] px-2 py-0.5 text-xs font-semibold text-white">
                    Latest
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                  <Clock className="w-3 h-3 shrink-0" />
                  Generated{' '}
                  {new Date(ranking.generated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF7CC] px-2.5 py-0.5 text-xs">
                  <User className="w-3 h-3 shrink-0 text-[#B45309]" />
                  <span className="text-[#B45309]">Top performer:</span>
                  <span className="font-semibold text-[#92400E]">
                    {ranking.rankings[0]?.user_name ?? 'N/A'}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:block h-9 w-px bg-gray-200 mr-5" />
          <Eye className="w-4 h-4 text-gray-400 hidden sm:block" />
          <VisibilityToggle rankLogId={ranking.id} isVisible={ranking.is_visible} />
        </div>
      </div>
    </div>
  );
}
