'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { RankLogPeriodType } from '@/types';
import type { EmployeePeriodParams } from '@/action-handlers/employee/stats';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const PERIOD_ORDER: RankLogPeriodType[] = ['weekly', 'monthly', 'yearly'];

export interface LatestPeriods {
  weekly: { year: number; week: number; is_visible: boolean } | null;
  monthly: { year: number; month: number; is_visible: boolean } | null;
  yearly: { year: number; is_visible: boolean } | null;
}

interface PeriodNavProps {
  periodType: RankLogPeriodType;
  onPeriodTypeChange: (periodType: RankLogPeriodType) => void;
}

/**
 * [<] Weekly | Monthly | Yearly [>] — retro style: dark brown buttons with golden borders, center label.
 */
export function PeriodNav({ periodType, onPeriodTypeChange }: PeriodNavProps) {
  const idx = PERIOD_ORDER.indexOf(periodType);
  const len = PERIOD_ORDER.length;
  const prevType = PERIOD_ORDER[(idx - 1 + len) % len];
  const nextType = PERIOD_ORDER[(idx + 1) % len];
  const label = periodType.charAt(0).toUpperCase() + periodType.slice(1);

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
      {/* Left: previous (wraps to Yearly when on Weekly) */}
      <button
        type="button"
        onClick={() => onPeriodTypeChange(prevType)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#b07440] text-white opacity-100 shadow-[2px_2px_0_rgba(0,0,0,0.4)] transition-colors hover:bg-[#8A6342] [&_svg]:opacity-100 sm:h-11 sm:w-11 md:h-12 md:w-12"
        aria-label="Previous period"
      >
        <ChevronLeft className="h-5 w-5 shrink-0 stroke-white sm:h-6 sm:w-6" strokeWidth={2.5} />
      </button>

      {/* Center: same style as "Top Kusineros of the Week" — #F4B925, no glow, no border */}
      <span
        className="min-w-[96px] px-2 py-1.5 text-center font-jersey text-xl tracking-widest text-[#F4B925] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:min-w-[120px] sm:px-4 sm:py-2 sm:text-2xl"
        aria-live="polite"
      >
        {label}
      </span>

      {/* Right: next (wraps to Weekly when on Yearly) */}
      <button
        type="button"
        onClick={() => onPeriodTypeChange(nextType)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#b07440] text-white opacity-100 shadow-[-2px_2px_0_rgba(0,0,0,0.4)] transition-colors hover:bg-[#8A6342] [&_svg]:opacity-100 sm:h-11 sm:w-11 md:h-12 md:w-12"
        aria-label="Next period"
      >
        <ChevronRight className="h-5 w-5 shrink-0 stroke-white sm:h-6 sm:w-6" strokeWidth={2.5} />
      </button>
    </div>
  );
}

/** Get the period params for the latest period of the given type (for fetching data).
 * Returns null when no period has been generated yet, or when the latest period is not visible.
 */
export function getLatestPeriodParams(
  periodType: RankLogPeriodType,
  latest: LatestPeriods
): EmployeePeriodParams | null {
  switch (periodType) {
    case 'weekly':
      return latest.weekly && latest.weekly.is_visible
        ? { periodType: 'weekly', year: latest.weekly.year, week: latest.weekly.week }
        : null;
    case 'monthly':
      return latest.monthly && latest.monthly.is_visible
        ? { periodType: 'monthly', year: latest.monthly.year, month: latest.monthly.month }
        : null;
    case 'yearly':
      return latest.yearly && latest.yearly.is_visible
        ? { periodType: 'yearly', year: latest.yearly.year }
        : null;
  }
}

/**
 * Build the page title: "Top Kusineros of the Week" | "Top Kusineros of the Month of January" | "Top Kusineros of the Year 2026"
 */
export function getLeaderboardTitle(periodType: RankLogPeriodType, latest: LatestPeriods): string {
  switch (periodType) {
    case 'weekly':
      return 'Top Kusineros of Week';
    case 'monthly':
      if (latest.monthly) {
        const monthName = MONTH_NAMES[latest.monthly.month - 1];
        return `Top Kusineros of the Month of ${monthName}`;
      }
      return 'Top Kusineros of the Month';
    case 'yearly':
      if (latest.yearly) {
        return `Top Kusineros of the Year ${latest.yearly.year}`;
      }
      return 'Top Kusineros of the Year';
  }
}
