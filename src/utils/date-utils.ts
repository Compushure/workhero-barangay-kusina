/**
 * Utility functions for date-related operations in task assignment and mercado items
 */

import { toZonedTime } from 'date-fns-tz';
import { startOfDay } from 'date-fns';

const MANILA_TIMEZONE = 'Asia/Manila';

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

  return parsedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Checks if a task is overdue based on its end date
 * @param endDate - The end date of the task (can be null)
 * @returns boolean - true if the task is overdue, false otherwise
 */
export function isTaskOverdue(endDate: string | null): boolean {
  if (!endDate) return false;
  const taskEndDate = getDateStringInManila(endDate);
  const todayDate = getCurrentManilaDateString();

  if (!taskEndDate) return false;

  return taskEndDate < todayDate;
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
 * Gets the CSS classes for overdue styling
 * @param endDate - The end date of the task
 * @returns string - CSS classes for overdue styling
 */
// export function getOverdueClasses(endDate: string): string {
//   return isTaskOverdue(endDate) ? 'text-red-700 font-semibold' : '';
// }
