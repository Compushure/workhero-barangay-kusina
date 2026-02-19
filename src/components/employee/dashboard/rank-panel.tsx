'use client';

import { useState } from 'react';
import { Trophy, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetEmployeeRank } from '@/hooks/tanstack/queries/employeeQueries';
import { useQuery } from '@tanstack/react-query';
import { getEmployeePerformanceScore } from '@/actions/employee/stats';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type { EmployeeRank } from '@/types';
import { RankWidgetSkeleton } from '../attendance/skeletons';

const PERFORMANCE_SCORE_TOOLTIP =
  'Performance Score = (number of approved tasks) × (total points earned from those tasks). Used for leaderboard ranking.';

const rankViews = ['weekly', 'monthly', 'yearly'];

interface RankWidgetProps {
  isCollapsed?: boolean;
}

export function RankWidget({ isCollapsed }: RankWidgetProps) {
  const [hovered, setHovered] = useState(false);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);

  const { data: rankData, isLoading: isRankLoading } = useGetEmployeeRank();

  const { data: performanceScoreResult, isLoading: isPerformanceScoreLoading } = useQuery({
    queryKey: ['employeePerformanceScore'],
    queryFn: async () => {
      const result = await getEmployeePerformanceScore();
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const performanceScore = performanceScoreResult ?? 0;
  const currentView = rankViews[currentViewIndex];

  const handlePrev = () => {
    setCurrentViewIndex((prev) => (prev === 0 ? rankViews.length - 1 : prev - 1));
  };
  const handleNext = () => {
    setCurrentViewIndex((prev) => (prev === rankViews.length - 1 ? 0 : prev + 1));
  };

  // ✅ Skeleton while loading
  if (isRankLoading || isPerformanceScoreLoading) {
    return <RankWidgetSkeleton isCollapsed={isCollapsed} />;
  }

  if (!rankData) {
    return (
      <div className="bg-[#765332] border-3 border-[#47331F] rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <button onClick={handlePrev}>
            <ChevronLeft className="text-[#9E9985] w-5 h-5" />
          </button>
          <span className="text-yellow-500 capitalize">{currentView}</span>
          <button onClick={handleNext}>
            <ChevronRight className="text-[#9E9985] w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-[#F5E8D6]">Not available yet</p>
      </div>
    );
  }

  const { rank } = rankData as EmployeeRank;

  if (isCollapsed) {
    return (
      <div
        className="bg-[#765332] border-[#47331F] rounded-full h-16 w-16 mx-auto flex flex-col items-center justify-center mb-4 transition-all duration-200"
        title={`Personal Rank #${rank} - ${performanceScore} Performance Score.`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Trophy size={16} className="text-yellow-500 mb-1" />
        <span className="text-xs text-[#F5E8D6]">#{rank}</span>
        {hovered && (
          <div className="absolute inset-0 bg-gray-400/40 rounded-full transition-opacity duration-200" />
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#765332] rounded-lg p-4 border-3 border-[#47331F] mb-4">
      {/* Header with arrows + view */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={handlePrev}>
          <ChevronLeft className="text-[#9E9985] w-5 h-5" />
        </button>
        <span className="text-yellow-500 capitalize">{currentView}</span>
        <button onClick={handleNext}>
          <ChevronRight className="text-[#9E9985] w-5 h-5" />
        </button>
      </div>

      {/* Rank + Trophy */}
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-white/20 rounded-full p-2 shrink-0 flex items-center justify-center">
          <Trophy size={20} className="text-yellow-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl text-[#F5E8D6]">#{rank}</span>
          <span className="text-xl text-[#F5E8D6]">Rank</span>
        </div>
      </div>

      {/* Performance Score */}
      <p className="text-sm text-[#F5E8D6] flex items-center gap-1.5">
        Performance Score:{' '}
        <span className="text-white font-semibold">{performanceScore}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex text-[#9E9985] cursor-pointer hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded"
              aria-label="How is performance score calculated?"
            >
              <HelpCircle size={14} className="shrink-0" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[240px]">
            {PERFORMANCE_SCORE_TOOLTIP}
          </TooltipContent>
        </Tooltip>
      </p>
    </div>
  );
}
