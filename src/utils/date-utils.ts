/**
 * Utility functions for date-related operations in task assignment and mercado items
 */

import { addDays, startOfDay } from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

const MANILA_TIMEZONE = 'Asia/Manila';

function isDateOnlyString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function toManilaDeadlineISOString(date: string | Date | null | undefined): string | null {
  if (!date) return null;

  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const manilaDate =
    typeof date === 'string' && isDateOnlyString(date)
      ? date
      : formatInTimeZone(parsedDate, MANILA_TIMEZONE, 'yyyy-MM-dd');

  return fromZonedTime(`${manilaDate} 23:59:59.999`, MANILA_TIMEZONE).toISOString();
}

function getManilaStartOfDay(date: Date): Date {
  return fromZonedTime(
    `${formatInTimeZone(date, MANILA_TIMEZONE, 'yyyy-MM-dd')} 00:00:00.000`,
    MANILA_TIMEZONE
  );
}

function getWeeklyIntervalRange(anchorDate: Date): { start: Date; end: Date } {
  const isoDay = Number(formatInTimeZone(anchorDate, MANILA_TIMEZONE, 'i'));
  const start = addDays(getManilaStartOfDay(anchorDate), -(isoDay - 1));
  const end = addDays(start, 5);

  return { start, end };
}

function getDatePartsInTimeZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  return {
    year: year ?? '0000',
    month: month ?? '01',
    day: day ?? '01',
  };
}

export function getCurrentManilaDateString(): string {
  const { year, month, day } = getDatePartsInTimeZone(new Date(), MANILA_TIMEZONE);
  return `${year}-${month}-${day}`;
}

export function getDateStringInManila(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  const { year, month, day } = getDatePartsInTimeZone(parsedDate, MANILA_TIMEZONE);
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date-like value into a short readable string.
 * @param date - Date value (string/date/null)
 * @returns formatted date string or fallback label
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'No due date';

  const parsedDate = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Invalid date';
  }

  return formatInTimeZone(parsedDate, MANILA_TIMEZONE, 'MMM d, yyyy');
}

/**
 * Checks if a task is overdue based on its end date
 * @param endDate - The end date of the task (can be null)
 * @returns boolean - true if the task is overdue, false otherwise
 */
export function isTaskOverdue(endDate: string | null): boolean {
  if (!endDate) return false;
  const normalizedDeadline = toManilaDeadlineISOString(endDate);

  if (!normalizedDeadline) return false;

  return Date.now() > new Date(normalizedDeadline).getTime();
}

/**
 * Checks if a mercado item is available now based on its availability date
 * Uses Philippines timezone (Asia/Manila) for comparison
 * @param availableDate - The date when the item becomes available (can be Date, string, null, or undefined)
 * @returns boolean - true if the item is available now, false otherwise
 */
export function isItemAvailableNow(availableDate: Date | string | null | undefined): boolean {
  // If no availableDate is set (null/undefined), item is always available
  if (!availableDate) {
    return true;
  }

  // Convert availableDate to Date object if it's a string
  const dateObj = typeof availableDate === 'string' ? new Date(availableDate) : availableDate;

  // Get current time in Manila timezone
  const nowInManila = toZonedTime(new Date(), MANILA_TIMEZONE);

  // Convert availableDate to start of day in Manila timezone
  const availableDateInManila = toZonedTime(dateObj, MANILA_TIMEZONE);
  const availableDateStartOfDay = startOfDay(availableDateInManila);

  // Get start of current day in Manila timezone
  const todayStartOfDay = startOfDay(nowInManila);

  // Item is available if current date >= available date (both at start of day)
  return todayStartOfDay.getTime() >= availableDateStartOfDay.getTime();
}

/**
 * Checks whether a mercado item has passed its active availability interval.
 * Uses Philippines timezone (Asia/Manila) for comparison.
 */
export function hasItemPassedAvailabilityInterval(
  availableDate: Date | string | null | undefined,
  availableMonth: 'weekly' | 'monthly' | 'yearly' | null | undefined
): boolean {
  if (!availableDate || !availableMonth) {
    return false;
  }

  const dateObj = typeof availableDate === 'string' ? new Date(availableDate) : availableDate;

  if (Number.isNaN(dateObj.getTime())) {
    return false;
  }

  const currentDate = getManilaStartOfDay(new Date());
  const anchorDate = getManilaStartOfDay(dateObj);

  if (availableMonth === 'weekly') {
    const { end } = getWeeklyIntervalRange(anchorDate);
    return currentDate.getTime() > end.getTime();
  }

  if (availableMonth === 'monthly') {
    return (
      currentDate.getFullYear() > anchorDate.getFullYear() ||
      (currentDate.getFullYear() === anchorDate.getFullYear() &&
        currentDate.getMonth() > anchorDate.getMonth())
    );
  }

  return currentDate.getFullYear() > anchorDate.getFullYear();
}

/**
 * Gets the CSS classes for overdue styling
 * @param endDate - The end date of the task
 * @returns string - CSS classes for overdue styling
 */
// export function getOverdueClasses(endDate: string): string {
//   return isTaskOverdue(endDate) ? 'text-red-700 font-semibold' : '';
// }
