'use client';

import { useState } from 'react';
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetEmployeeRank } from '@/hooks/tanstack/queries/employeeQueries';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type { TimePeriod } from '@/lib/utils/time-period-utils';

const PERFORMANCE_SCORE_TOOLTIP =
  'Performance Score = (number of approved tasks) × (total points earned from those tasks). Used for leaderboard ranking.';

// Period display labels
const PERIOD_LABELS: Record<TimePeriod | 'current', string> = {
  current: 'Current',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

// Period order for navigation
const PERIODS: (TimePeriod | 'current')[] = ['current', 'weekly', 'monthly', 'yearly'];

/**
 * Main Rank Widget Renderer
 * Fetches employee rank + performance score (points) and displays them consistently
 * Supports time-period filtering (Current/Weekly/Monthly/Yearly)
 */
export function RankWidget() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod | 'current'>('current');

  // Fetch employee rank and performance score for selected period
  const { data: rankData, isLoading: isRankLoading } = useGetEmployeeRank(selectedPeriod);

  // Navigation handlers
  const goToPreviousPeriod = () => {
    const currentIndex = PERIODS.indexOf(selectedPeriod);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : PERIODS.length - 1;
    setSelectedPeriod(PERIODS[previousIndex]);
  };

  const goToNextPeriod = () => {
    const currentIndex = PERIODS.indexOf(selectedPeriod);
    const nextIndex = currentIndex < PERIODS.length - 1 ? currentIndex + 1 : 0;
    setSelectedPeriod(PERIODS[nextIndex]);
  };

  // Extract performance score from rank data (period-specific)
  const performanceScore = rankData?.performanceScore ?? 0;

  // Match XP progress card: bg-[#765332], border-[#47331F], shadow-md
  const cardClassName =
    'bg-[#765332] rounded-lg shadow-md border-3 border-[#47331F] p-3 mb-4 w-[280px] min-h-[120px] shrink-0 font-jersey tracking-widest';

  // Navigation component (reused in loading + filled states)
  const navigationControls = (
    <div className="flex items-center justify-center gap-2 mb-2">
      <button
        onClick={goToPreviousPeriod}
        className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-1.5 transition-colors"
        aria-label="Previous period"
      >
        <ChevronLeft size={14} />
      </button>
      <div className="min-w-20 text-center ">
        <span className="text-base font-medium text-yellow-500">
          {PERIOD_LABELS[selectedPeriod]}
        </span>
      </div>
      <button
        onClick={goToNextPeriod}
        className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-1.5 transition-colors"
        aria-label="Next period"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );

  if (isRankLoading) {
    return (
      <div className={`${cardClassName} animate-pulse`}>
        {navigationControls}
        <div className="flex items-center gap-3">
          {/* Trophy + rank skeleton */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 bg-white/20 rounded-full shrink-0" aria-hidden />
            <div className="flex items-baseline gap-1.5">
              <div className="h-7 w-10 bg-white/20 rounded" aria-hidden />
              <div className="h-3.5 w-8 bg-white/20 rounded" aria-hidden />
            </div>
          </div>
          <div className="h-12 border-l-2 border-white/40 shrink-0" />
          {/* Performance score skeleton */}
          <div className="flex flex-col items-center flex-1 min-w-0 pl-2">
            <div className="h-3 w-24 bg-white/20 rounded mb-1" aria-hidden />
            <div className="h-6 w-12 bg-white/20 rounded" aria-hidden />
          </div>
        </div>
      </div>
    );
  }

  if (!rankData) {
    return null;
  }

  const { rank } = rankData;

  // Empty state: period selector + "Not available yet" only (same card size as filled/loading)
  if (performanceScore === 0) {
    return (
      <div className={`${cardClassName} flex flex-col`}>
        {navigationControls}
        <div className="flex flex-col items-center justify-center min-h-[52px] py-2">
          <span className="text-sm text-white italic">Not available yet</span>
        </div>
      </div>
    );
  }

  // Filled state: rank + performance score
  return (
    <div className={cardClassName}>
      {navigationControls}

      <div className="flex items-center gap-3">
        {/* Left: Rank Section */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/20 rounded-full p-2">
            <Trophy size={20} className="text-yellow-300" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white">#{rank}</span>
            <span className="text-sm text-white">Rank</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-12 border-l-2 border-white/40 shrink-0" />

        {/* Right: Performance Score Section */}
        <div className="flex flex-col items-center flex-1 min-w-0 pl-2">
          <span className="text-xs text-white whitespace-nowrap mb-1">Performance Score</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xl font-bold text-white cursor-help">{performanceScore}</span>
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
