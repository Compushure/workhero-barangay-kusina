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

  // Loading state
  if (isRankLoading) {
    return (
      <div className="bg-white/10 rounded-lg p-4 mb-4 animate-pulse">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 rounded-full p-2 shrink-0">
            <Trophy size={20} className="text-yellow-300" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="h-7 w-12 bg-white/20 rounded"></div>
            <div className="h-3 w-10 bg-white/20 rounded"></div>
          </div>
        </div>
        <div className="h-3 w-full bg-white/20 rounded"></div>
      </div>
    );
  }

  if (!rankData) {
    return null;
  }

  const { rank } = rankData;

  // Navigation component (reused in all states)
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
        <span className="text-base font-medium text-white">{PERIOD_LABELS[selectedPeriod]}</span>
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

  return (
    <div className="bg-white/10 rounded-lg p-3 mb-4">
      {navigationControls}

      {/* Conditional content based on performance score */}
      {performanceScore === 0 ? (
        <div className="flex items-center justify-center py-4">
          <span className="text-sm text-red-200/70 italic">Not available yet</span>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {/* Left: Rank Section */}
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Trophy size={20} className="text-yellow-300" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white">#{rank}</span>
              <span className="text-sm text-red-200">Rank</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-12 border-l-2 border-white/40"></div>

          {/* Right: Performance Score Section */}
          <div className="flex flex-col items-center flex-1">
            <span className="text-xs text-red-200 whitespace-nowrap mb-1">Performance Score</span>
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
      )}
    </div>
  );
}
