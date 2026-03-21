'use client';

import { Trophy } from 'lucide-react';
import { useGetEmployeeRank } from '@/hooks/tanstack/queries/employeeQueries';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const PERFORMANCE_SCORE_TOOLTIP = 'Performance Score = (Task Points × Completed Tasks) + Badge Points';

export function RankWidget() {
  const { data: rankData, isLoading: isRankLoading } = useGetEmployeeRank();

  const performanceScore = rankData?.performanceScore ?? 0;
  const rank = rankData?.rank ?? 1;

  const cardClassName =
    'rounded-lg shadow-md wood-panel p-2 mb-4 -ml-2 w-[320px] min-h-[90px] shrink-0 font-jersey tracking-widest';

  if (isRankLoading) {
    return (
      <div className={`${cardClassName} animate-pulse`}>
        <div className="w-28 h-5 bg-white/20 rounded mx-auto mb-3" />
        <div className="border-t-2 border-white/30 mb-3" />

        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 bg-white/20 rounded-full" />
            <div className="h-7 w-12 bg-white/20 rounded" />
          </div>

          <div className="hidden sm:block h-12 border-l-2 border-white/30 mx-2 sm:mx-4" />

          <div className="h-7 w-14 bg-white/20 rounded justify-self-center" />
        </div>
      </div>
    );
  }

  if (!rankData || performanceScore === 0) {
    return (
      <div className={cardClassName}>
        <h2 className="text-lg text-yellow-500 text-center mb-2">Weekly Rank</h2>
        <div className="border-t-2 border-white/30 mb-3" />

        <div className="flex items-center justify-center min-h-[60px]">
          <span className="text-sm text-white italic">Not available yet</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClassName}>
      <h2 className="text-lg text-yellow-500 text-center mb-2">Weekly Rank</h2>

      <div className="border-t-2 border-white/30 mb-3" />

      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        <div className="flex items-center justify-center gap-3">
          <div className="bg-white/20 rounded-full p-2">
            <Trophy size={20} className="text-yellow-500" />
          </div>
          <span className="text-2xl text-white">#{rank}</span>
        </div>

        <div className="h-12 border-l-2 border-white/30" />

        <div className="flex flex-col items-center justify-self-center">
          <span className="text-sm leading-[1.05] text-yellow-500 text-center mb-1">
            Performance Score
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xl text-white cursor-help">{performanceScore}</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-60">
              {PERFORMANCE_SCORE_TOOLTIP}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
