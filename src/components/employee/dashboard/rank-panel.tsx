'use client';

import { Trophy } from 'lucide-react';
import { useGetEmployeeRank } from '@/hooks/tanstack/queries/employeeQueries';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const PERFORMANCE_SCORE_TOOLTIP =
  'Performance Score = (Task Points × Completed Tasks) + Badge Points';

interface RankWidgetProps {
  className?: string;
}

export function RankWidget({ className }: RankWidgetProps = {}) {
  const { data: rankData, isLoading: isRankLoading } = useGetEmployeeRank();

  const performanceScore = rankData?.performanceScore ?? 0;
  const rank = rankData?.rank ?? 1;

  const cardClassName = cn(
    'rounded-lg shadow-md wood-panel p-2 mb-4 -ml-2 w-62 min-h-[90px] shrink-0 font-jersey tracking-widest',
    className
  );

  if (isRankLoading) {
    return (
      <div className={`${cardClassName} animate-pulse`}>
        <div className="mx-auto mb-2 h-5 w-28 rounded bg-white/20" />
        <div className="mb-3 border-t-2 border-white/30" />

        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <div className="h-8 w-8 rounded-full bg-white/20 sm:h-10 sm:w-10" />
            <div className="h-6 w-10 rounded bg-white/20 sm:h-7 sm:w-12" />
          </div>

          <div className="h-10 border-l-2 border-white/30 sm:h-12" />

          <div className="justify-self-center">
            <div className="mb-1 h-3 w-16 rounded bg-white/20 sm:h-4 sm:w-20" />
            <div className="h-6 w-12 rounded bg-white/20 sm:h-7 sm:w-14" />
          </div>
        </div>
      </div>
    );
  }

  if (!rankData || performanceScore === 0) {
    return (
      <div className={cardClassName}>
        <h2 className="mb-2 text-center text-base text-yellow-500 sm:text-lg">Weekly Rank</h2>
        <div className="border-t-2 border-white/30 mb-3" />

        <div className="flex items-center justify-center min-h-15">
          <span className="text-xs italic text-white sm:text-sm">Not available yet</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClassName}>
      <h2 className="mb-2 text-center text-base text-yellow-500 sm:text-lg">Weekly Rank</h2>

      <div className="border-t-2 border-white/30 mb-3" />

      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <div className="rounded-full bg-white/20 p-1.5 sm:p-2">
            <Trophy size={18} className="text-yellow-500 sm:h-5 sm:w-5" />
          </div>
          <span className="text-xl text-white sm:text-2xl">#{rank}</span>
        </div>

        <div className="h-10 border-l-2 border-white/30 sm:h-12" />

        <div className="flex flex-col items-center justify-self-center">
          <span className="mb-1 text-center text-[10px] leading-[1.05] text-yellow-500 sm:text-sm">
            Performance Score
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help text-lg text-white sm:text-xl">{performanceScore}</span>
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
