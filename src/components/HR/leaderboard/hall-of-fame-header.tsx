'use client';

import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import Link from 'next/link';
import { getDynamicDescription, getParticipationMessage, type Period } from '@/lib/leaderboard-utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HallOfFameHeaderProps {
  periodLabel: string;
  period: Period;
  userCount: number;
  prevPeriod: Period;
  nextPeriod: Period;
}

/**
 * HallOfFameHeader: Header component for the leaderboard with period navigation
 */
export default function HallOfFameHeader({
  periodLabel,
  period,
  userCount,
  prevPeriod,
  nextPeriod,
}: HallOfFameHeaderProps) {
  const description = getDynamicDescription(period, userCount);
  const participationMessage = getParticipationMessage(userCount, period);
  return (
    <div className="flex flex-col items-center mb-6 sm:mb-8">
      <div className="flex items-center gap-3 sm:gap-4 mb-2">
        <span className="text-2xl sm:text-3xl">🏆</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#6D1616]">Hall of Fame</h1>
        <span className="text-2xl sm:text-3xl">🏆</span>
      </div>

      {/* Period Selector with Arrows */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href={`/hr/leaderboard?period=${prevPeriod}`}
          className="p-1.5 sm:p-2 hover:bg-[#F9F3E9] rounded-full transition-colors"
          aria-label={`Previous period: ${prevPeriod}`}
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#6D1616]" />
        </Link>
        <span className="text-lg sm:text-xl font-semibold text-[#6D1616] min-w-25 sm:min-w-30 text-center">
          {periodLabel}
        </span>
        <Link
          href={`/hr/leaderboard?period=${nextPeriod}`}
          className="p-1.5 sm:p-2 hover:bg-[#F9F3E9] rounded-full transition-colors"
          aria-label={`Next period: ${nextPeriod}`}
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#6D1616]" />
        </Link>
      </div>

      {/* Description with info tooltip */}
      <div className="flex items-center gap-2 mt-2">
        {description && (
          <p className="text-gray-500 text-sm sm:text-base text-center">{description}</p>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Info className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-xs">
              Performance Score is calculated from number of completed and approved tasks × total points earned (lifetime).
              Complete more tasks to climb the rankings!
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Participation message when <10 users */}
      {participationMessage && (
        <p className="text-[#6D1616] text-sm font-medium text-center mt-1.5 bg-[#F9F3E9] px-4 py-2 rounded-lg inline-block">
          {participationMessage}
        </p>
      )}
    </div>
  );
}
