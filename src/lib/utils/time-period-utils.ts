/**
 * Time Period Utilities
 * Utilities for calculating time period cutoffs for leaderboard snapshots
 */

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
      // Get start of current week (Monday 00:00:00), then subtract 1ms to get end of previous week
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days since last Monday
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - daysToMonday);
      startOfWeek.setHours(0, 0, 0, 0);
      cutoff = new Date(startOfWeek.getTime() - 1); // Subtract 1ms to get end of previous week
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
