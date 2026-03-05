/**
 * Time Period Utilities
 * Utilities for calculating time period cutoffs for leaderboard snapshots.
 * Weekly periods use ISO week numbering (Week 1–52/53 per year).
 */

import {
  startOfISOWeek,
  endOfISOWeek,
  addWeeks,
  addDays,
  format,
  getISOWeek,
} from 'date-fns';
import type { RankLogPeriodType, RankingPeriodType } from '@/types';

/** Jan 4 is always in ISO week 1 of its year; used as anchor for ISO week math */
const ISO_WEEK_1_ANCHOR = (year: number) => new Date(year, 0, 4);

export type TimePeriod = 'weekly' | 'monthly' | 'yearly';

/**
 * Compute cutoff timestamp for a given time period.
 * Returns the end of the previous completed period (timestamp just before the start of the current period).
 * 
 * @param period - The time period to calculate cutoff for
 * @returns ISO string timestamp representing the cutoff date
 * 
 * @example
 * // For weekly: Returns end of last week (Sunday 23:59:59.999)
 * // For monthly: Returns end of last month (last day 23:59:59.999)
 * // For yearly: Returns end of last year (Dec 31 23:59:59.999)
 */
export function getCutoffForPeriod(period: TimePeriod): string {
  const now = new Date();
  let cutoff: Date;

  switch (period) {
    case 'weekly': {
      const startOfCurrent = startOfISOWeek(now);
      cutoff = new Date(startOfCurrent.getTime() - 1);
      break;
    }
    case 'monthly': {
      // Get first day of current month (00:00:00), then subtract 1ms to get end of previous month
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      cutoff = new Date(firstDayOfMonth.getTime() - 1);
      break;
    }
    case 'yearly': {
      // Get first day of current year (00:00:00), then subtract 1ms to get end of previous year
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      cutoff = new Date(firstDayOfYear.getTime() - 1);
      break;
    }
  }

  return cutoff.toISOString();
}

/**
 * Compute cutoff timestamp for a specific period (year/month/week).
 * Weekly: ISO week 1–52/53; month is ignored. Returns end of that ISO week (Sunday 23:59:59.999).
 */
export function getCutoffForSpecificPeriod(
  periodType: RankLogPeriodType,
  year: number,
  month?: number,
  week?: number
): string {
  let cutoff: Date;

  switch (periodType) {
    case 'weekly': {
      if (week == null) {
        throw new Error('week is required for weekly period');
      }
      const week1Monday = startOfISOWeek(ISO_WEEK_1_ANCHOR(year));
      const targetMonday = addWeeks(week1Monday, week - 1);
      cutoff = endOfISOWeek(targetMonday);
      break;
    }
    case 'monthly': {
      if (month == null) {
        throw new Error('month is required for monthly period');
      }
      // Last ms of the last day of the given month
      const lastDay = new Date(year, month, 0).getDate();
      cutoff = new Date(year, month - 1, lastDay, 23, 59, 59, 999);
      break;
    }
    case 'yearly': {
      cutoff = new Date(year, 11, 31, 23, 59, 59, 999);
      break;
    }
  }

  return cutoff.toISOString();
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

/**
 * Build a human-readable period label.
 * Weekly: "Week 5, 2026". Monthly: "March 2026". Yearly: "2026".
 */
export function buildPeriodLabel(
  periodType: RankLogPeriodType,
  year: number,
  month?: number,
  week?: number
): string {
  switch (periodType) {
    case 'weekly': {
      if (week == null) {
        throw new Error('week is required for weekly period label');
      }
      return `Week ${week}, ${year}`;
    }
    case 'monthly': {
      if (month == null) {
        throw new Error('month is required for monthly period label');
      }
      return `${MONTH_NAMES[month - 1]} ${year}`;
    }
    case 'yearly':
      return `${year}`;
  }
}

/**
 * Returns the start (Monday 00:00) and end (Sunday 23:59:59.999) of the given ISO week.
 */
export function getISOWeekDateRange(isoYear: number, isoWeek: number): { start: Date; end: Date } {
  const week1Monday = startOfISOWeek(ISO_WEEK_1_ANCHOR(isoYear));
  const targetMonday = addWeeks(week1Monday, isoWeek - 1);
  return {
    start: targetMonday,
    end: endOfISOWeek(targetMonday),
  };
}

/**
 * Returns a short label for the ISO week date range, e.g. "Jan 27 – Feb 2, 2026".
 */
export function getISOWeekDateRangeLabel(isoYear: number, isoWeek: number): string {
  const { start, end } = getISOWeekDateRange(isoYear, isoWeek);
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
}

/**
 * Returns the number of ISO weeks in the given year (52 or 53).
 */
export function getISOWeeksInYear(year: number): number {
  return getISOWeek(new Date(year, 11, 28));
}

/**
 * Compute period_start and period_end dates for a given period.
 * Used by server actions to derive the date range before inserting into RankingPeriod.
 */
export function getPeriodStartEnd(
  periodType: RankingPeriodType,
  year: number,
  month?: number,
  week?: number
): { start: Date; end: Date } {
  switch (periodType) {
    case 'weekly': {
      if (week == null) throw new Error('week is required for weekly period');
      return getISOWeekDateRange(year, week);
    }
    case 'monthly': {
      if (month == null) throw new Error('month is required for monthly period');
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0); // last day of month
      return { start, end };
    }
    case 'yearly': {
      return { start: new Date(year, 0, 1), end: new Date(year, 11, 31) };
    }
  }
}

/**
 * Returns a human-readable date range subtitle, or null when not applicable.
 * For weekly rankings: "Jan 27 – Feb 2, 2026" (derived from period_start date).
 */
export function getPeriodDateRangeSubtitle(ranking: {
  period_type: RankingPeriodType;
  period_start: string;
}): string | null {
  if (ranking.period_type === 'weekly') {
    const start = new Date(ranking.period_start + 'T00:00:00');
    const end = addDays(start, 6);
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
  }
  return null;
}
