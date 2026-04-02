/**
 * Time Period Utilities
 * Utilities for calculating time period cutoffs for leaderboard snapshots.
 * Weekly periods use ISO week numbering (Week 1-52/53 per year).
 */

import { addDays, addWeeks, format, getISOWeek, startOfISOWeek } from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';
import type { RankLogPeriodType, RankingPeriodType } from '@/types';

const MANILA_TIMEZONE = 'Asia/Manila';

/** Jan 4 is always in ISO week 1 of its year; used as anchor for ISO week math */
const ISO_WEEK_1_ANCHOR = (year: number) =>
  toZonedTime(fromZonedTime(`${year}-01-04 12:00:00`, MANILA_TIMEZONE), MANILA_TIMEZONE);

export type TimePeriod = 'weekly' | 'monthly' | 'yearly';

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function manilaStartOfDay(date: Date): Date {
  return fromZonedTime(
    `${formatInTimeZone(date, MANILA_TIMEZONE, 'yyyy-MM-dd')} 00:00:00.000`,
    MANILA_TIMEZONE
  );
}

function manilaEndOfDay(date: Date): Date {
  return fromZonedTime(
    `${formatInTimeZone(date, MANILA_TIMEZONE, 'yyyy-MM-dd')} 23:59:59.999`,
    MANILA_TIMEZONE
  );
}

function manilaDateAtMidnight(year: number, month: number, day: number): Date {
  return fromZonedTime(`${year}-${pad2(month)}-${pad2(day)} 00:00:00.000`, MANILA_TIMEZONE);
}

export function toManilaDateString(date: Date): string {
  return formatInTimeZone(date, MANILA_TIMEZONE, 'yyyy-MM-dd');
}

export function parseManilaDateString(dateStr: string): Date {
  return fromZonedTime(`${dateStr} 00:00:00.000`, MANILA_TIMEZONE);
}

/**
 * Compute cutoff timestamp for a given time period.
 * Returns the end of the previous completed period (timestamp just before the start of the current period).
 */
export function getCutoffForPeriod(period: TimePeriod): string {
  const now = toZonedTime(new Date(), MANILA_TIMEZONE);
  let cutoff: Date;

  switch (period) {
    case 'weekly': {
      const startOfCurrent = startOfISOWeek(now);
      cutoff = new Date(manilaStartOfDay(startOfCurrent).getTime() - 1);
      break;
    }
    case 'monthly': {
      const firstDayOfMonth = manilaDateAtMidnight(now.getFullYear(), now.getMonth() + 1, 1);
      cutoff = new Date(firstDayOfMonth.getTime() - 1);
      break;
    }
    case 'yearly': {
      const firstDayOfYear = manilaDateAtMidnight(now.getFullYear(), 1, 1);
      cutoff = new Date(firstDayOfYear.getTime() - 1);
      break;
    }
  }

  return cutoff.toISOString();
}

/**
 * Compute cutoff timestamp for a specific period (year/month/week).
 * Weekly: ISO week 1-52/53; month is ignored. Returns end of that ISO week in Manila time.
 */
export function getCutoffForSpecificPeriod(
  periodType: RankLogPeriodType,
  year: number,
  month?: number,
  week?: number
): string {
  switch (periodType) {
    case 'weekly': {
      if (week == null) {
        throw new Error('week is required for weekly period');
      }
      const { end } = getISOWeekDateRange(year, week);
      return manilaEndOfDay(end).toISOString();
    }
    case 'monthly': {
      if (month == null) {
        throw new Error('month is required for monthly period');
      }
      const { end } = getPeriodStartEnd(periodType, year, month);
      return manilaEndOfDay(end).toISOString();
    }
    case 'yearly': {
      const { end } = getPeriodStartEnd(periodType, year);
      return manilaEndOfDay(end).toISOString();
    }
  }
}

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
 * Returns the start (Monday) and end (Saturday) of the given ISO week in Manila-local dates.
 */
export function getISOWeekDateRange(isoYear: number, isoWeek: number): { start: Date; end: Date } {
  const week1Monday = startOfISOWeek(ISO_WEEK_1_ANCHOR(isoYear));
  const targetMonday = addWeeks(week1Monday, isoWeek - 1);
  const targetSaturday = addDays(targetMonday, 5);

  return {
    start: manilaStartOfDay(targetMonday),
    end: manilaStartOfDay(targetSaturday),
  };
}

/**
 * Returns a short label for the ISO week date range, e.g. "Jan 27 - Feb 1, 2026".
 */
export function getISOWeekDateRangeLabel(isoYear: number, isoWeek: number): string {
  const { start, end } = getISOWeekDateRange(isoYear, isoWeek);
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
}

/**
 * Returns a compact ISO week date range, e.g. "Mar 9-14, 2026"
 * or "Feb 23-Mar 1, 2026" when the week crosses months.
 */
export function getISOWeekDateRangeLabelShort(isoYear: number, isoWeek: number): string {
  const { start, end } = getISOWeekDateRange(isoYear, isoWeek);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  return sameMonth
    ? `${format(start, 'MMM d')}-${format(end, 'd, yyyy')}`
    : `${format(start, 'MMM d')}-${format(end, 'MMM d, yyyy')}`;
}

/**
 * Returns the number of ISO weeks in the given year (52 or 53).
 */
export function getISOWeeksInYear(year: number): number {
  return getISOWeek(
    toZonedTime(fromZonedTime(`${year}-12-28 12:00:00`, MANILA_TIMEZONE), MANILA_TIMEZONE)
  );
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
      const lastDay = new Date(year, month, 0).getDate();
      return {
        start: manilaDateAtMidnight(year, month, 1),
        end: manilaDateAtMidnight(year, month, lastDay),
      };
    }
    case 'yearly': {
      return {
        start: manilaDateAtMidnight(year, 1, 1),
        end: manilaDateAtMidnight(year, 12, 31),
      };
    }
  }
}

/**
 * Returns a human-readable date range subtitle, or null when not applicable.
 * For weekly rankings: "Jan 27 - Feb 1, 2026" (derived from period_start date).
 */
export function getPeriodDateRangeSubtitle(ranking: {
  period_type: RankingPeriodType;
  period_start: string;
}): string | null {
  if (ranking.period_type === 'weekly') {
    const start = parseManilaDateString(ranking.period_start);
    const end = addDays(start, 5);
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  }
  return null;
}
