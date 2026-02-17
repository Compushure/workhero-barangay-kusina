'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { Period } from '@/lib/leaderboard-utils';

interface HallOfFameHeaderProps {
  periodLabel: string;
  description?: string;
  prevPeriod: Period;
  nextPeriod: Period;
}

/**
 * HallOfFameHeader: Header component for the leaderboard with period navigation
 */
export default function HallOfFameHeader({
  periodLabel,
  description,
  prevPeriod,
  nextPeriod,
}: HallOfFameHeaderProps) {
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

      {description && (
        <p className="text-gray-500 text-sm sm:text-base text-center mt-2">{description}</p>
      )}
    </div>
  );
}
