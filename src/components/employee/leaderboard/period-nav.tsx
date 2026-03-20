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

export function PeriodNav({ periodType, onPeriodTypeChange }: PeriodNavProps) {
  const idx = PERIOD_ORDER.indexOf(periodType);
  const len = PERIOD_ORDER.length;
  const prevType = PERIOD_ORDER[(idx - 1 + len) % len];
  const nextType = PERIOD_ORDER[(idx + 1) % len];
  const label = periodType.charAt(0).toUpperCase() + periodType.slice(1);

  return (
    <div className="inline-flex w-full max-w-[248px] items-center justify-center gap-3 sm:max-w-[272px] sm:gap-4">
      <button
        type="button"
        onClick={() => onPeriodTypeChange(prevType)}
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-sm border-[3px] border-[#47331F] bg-[#6F4A2B] text-white shadow-[4px_4px_0px_#000] shadow-[#3017008e] transition-all duration-150 hover:translate-y-1 hover:bg-[#7C5432] hover:shadow-[2px_2px_0px_#000] sm:h-11 sm:w-11"
        aria-label="Previous period"
      >
        <ChevronLeft className="h-4 w-4 shrink-0 stroke-white sm:h-[18px] sm:w-[18px]" strokeWidth={2.25} />
      </button>

      <div className="min-w-0 flex-1 text-center">
        <span
          className="block font-jersey text-xl leading-none tracking-[0.08em] text-[#F4B925] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-2xl"
          aria-live="polite"
        >
          {label}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onPeriodTypeChange(nextType)}
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-sm border-[3px] border-[#47331F] bg-[#6F4A2B] text-white shadow-[4px_4px_0px_#000] shadow-[#3017008e] transition-all duration-150 hover:translate-y-1 hover:bg-[#7C5432] hover:shadow-[2px_2px_0px_#000] sm:h-11 sm:w-11"
        aria-label="Next period"
      >
        <ChevronRight className="h-4 w-4 shrink-0 stroke-white sm:h-[18px] sm:w-[18px]" strokeWidth={2.25} />
      </button>
    </div>
  );
}

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
