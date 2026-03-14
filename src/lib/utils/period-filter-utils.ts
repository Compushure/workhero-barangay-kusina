/**
 * Period filter utilities for leaderboard date/week/month/year filtering.
 * Shared by employee past-ranks-list and HR period-filters.
 */

import { format, isSameISOWeek, startOfISOWeek, endOfISOWeek } from 'date-fns';
import type { RankingPeriodType, RankingPeriodWithTop } from '@/types';

export const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export const YEAR_RANGE_SIZE = 12;

export function getYearRangeStart(year: number): number {
  return Math.floor(year / YEAR_RANGE_SIZE) * YEAR_RANGE_SIZE;
}

export interface GetTriggerLabelOptions {
  /** Label when no date is selected. Default '' */
  emptyLabel?: string;
}

export function getTriggerLabel(
  activeTab: RankingPeriodType,
  selectedDate: Date | null,
  options?: GetTriggerLabelOptions
): string {
  const emptyLabel = options?.emptyLabel ?? '';
  if (selectedDate === null) return emptyLabel;

  switch (activeTab) {
    case 'weekly': {
      const weekStart = startOfISOWeek(selectedDate);
      const weekEnd = endOfISOWeek(selectedDate);
      const startStr = format(weekStart, 'MMM d');
      const crossesMonth = weekStart.getMonth() !== weekEnd.getMonth();
      const endStr = crossesMonth ? format(weekEnd, 'MMM d, yyyy') : format(weekEnd, 'd, yyyy');
      return `${startStr} – ${endStr}`;
    }
    case 'monthly':
      return format(selectedDate, 'MMMM yyyy');
    case 'yearly':
      return String(selectedDate.getFullYear());
  }
}

export function matchesDate(
  row: RankingPeriodWithTop,
  selectedDate: Date | null,
  activeTab: RankingPeriodType
): boolean {
  if (selectedDate === null) return true;
  const start = new Date(row.period_start + 'T00:00:00');
  switch (activeTab) {
    case 'weekly':
      return isSameISOWeek(start, selectedDate);
    case 'monthly':
      return (
        start.getFullYear() === selectedDate.getFullYear() &&
        start.getMonth() === selectedDate.getMonth()
      );
    case 'yearly':
      return start.getFullYear() === selectedDate.getFullYear();
  }
}
