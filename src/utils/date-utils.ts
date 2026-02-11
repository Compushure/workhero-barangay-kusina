/**
 * Utility functions for date-related operations in task assignment and mercado items
 */

import { toZonedTime } from 'date-fns-tz';
import { startOfDay } from 'date-fns';

const MANILA_TIMEZONE = 'Asia/Manila';

/**
 * Checks if a task is overdue based on its end date
 * @param endDate - The end date of the task
 * @returns boolean - true if the task is overdue, false otherwise
 */
export function isTaskOverdue(endDate: string): boolean {
  const taskEnd = new Date(new Date(endDate).setHours(0, 0, 0, 0));
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  return taskEnd.getTime() < today.getTime();
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
