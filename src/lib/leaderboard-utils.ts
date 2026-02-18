/**
 * Leaderboard Utilities
 * Shared utilities and configuration for the HR leaderboard feature
 */

export const PERIODS = ['current', 'weekly', 'monthly', 'yearly'] as const;
export type Period = (typeof PERIODS)[number];

export const PERIOD_CONFIG = {
  current: {
    label: 'Current',
    description: 'All-time cumulative Top 10 performers.',
    emptyMessage: undefined,
  },
  weekly: {
    label: 'Weekly',
    description: 'Snapshot of Top 10 as of end of last week.',
    emptyMessage: "The weekly rankings haven't been released yet. Check back later!",
  },
  monthly: {
    label: 'Monthly',
    description: 'Snapshot of Top 10 as of end of last month.',
    emptyMessage: "The monthly rankings haven't been released yet. Check back later!",
  },
  yearly: {
    label: 'Yearly',
    description: 'Snapshot of Top 10 as of end of last year.',
    emptyMessage: "The yearly rankings haven't been released yet. Check back later!",
  },
} as const;

/**
 * Get the adjacent period for navigation (prev/next)
 */
export function getAdjacentPeriod(currentPeriod: Period, direction: 'prev' | 'next'): Period {
  const currentIndex = PERIODS.indexOf(currentPeriod);

  if (direction === 'prev') {
    return PERIODS[currentIndex > 0 ? currentIndex - 1 : PERIODS.length - 1];
  }
  return PERIODS[currentIndex < PERIODS.length - 1 ? currentIndex + 1 : 0];
}

/**
 * Get the appropriate empty state message based on period
 */
export function getEmptyMessage(period: Period, error?: string | null): string {
  return (
    PERIOD_CONFIG[period].emptyMessage || error || 'No leaderboard data available at the moment.'
  );
}

/**
 * Calculate the next release date for each period type
 */
export function getNextReleaseDate(period: Period): Date | null {
  if (period === 'current') return null;

  const now = new Date();
  let nextDate: Date;

  switch (period) {
    case 'weekly':
      // Next Monday
      nextDate = new Date(now);
      const dayOfWeek = nextDate.getDay();
      const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
      nextDate.setDate(nextDate.getDate() + daysUntilMonday);
      nextDate.setHours(0, 0, 0, 0);
      break;

    case 'monthly':
      // First day of next month
      nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      nextDate.setHours(0, 0, 0, 0);
      break;

    case 'yearly':
      // January 1st of next year
      nextDate = new Date(now.getFullYear() + 1, 0, 1);
      nextDate.setHours(0, 0, 0, 0);
      break;

    default:
      return null;
  }

  return nextDate;
}

/**
 * Format a date for display in the empty state
 */
export function formatNextReleaseDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get schedule information for HR admin view
 */
export function getScheduleInfo(period: Period): {
  frequency: string;
  nextUpdate: string | null;
} | null {
  const nextDate = getNextReleaseDate(period);

  switch (period) {
    case 'weekly':
      return {
        frequency: 'Every Monday',
        nextUpdate: nextDate ? formatNextReleaseDate(nextDate) : null,
      };
    case 'monthly':
      return {
        frequency: '1st of each month',
        nextUpdate: nextDate ? formatNextReleaseDate(nextDate) : null,
      };
    case 'yearly':
      return {
        frequency: 'January 1st',
        nextUpdate: nextDate ? formatNextReleaseDate(nextDate) : null,
      };
    default:
      return null;
  }
}

/**
 * Get dynamic description based on actual user count
 * @param period - The time period filter
 * @param userCount - Number of users in the leaderboard
 * @returns Dynamic description text
 */
export function getDynamicDescription(period: Period, userCount: number): string {
  const baseConfig = PERIOD_CONFIG[period];
  
  if (userCount === 0) {
    return baseConfig.description;
  }
  
  // Replace "Top 10" with dynamic count
  const countText = userCount === 10 ? 'Top 10' : `Top ${userCount}`;
  
  if (period === 'current') {
    return `All-time cumulative ${countText} performers.`;
  }
  
  return `Snapshot of ${countText} as of end of last ${period === 'weekly' ? 'week' : period === 'monthly' ? 'month' : 'year'}.`;
}

/**
 * Get participation message when user count is less than 10
 * @param userCount - Number of users in the leaderboard
 * @param period - The time period filter
 * @returns Participation message or null if count >= 10
 */
export function getParticipationMessage(userCount: number, period: Period): string | null {
  if (userCount >= 10) {
    return null;
  }
  
  if (userCount === 0) {
    return null;
  }
  
  const remaining = 10 - userCount;
  const periodText = period === 'current' ? 'Complete tasks to join the Hall of Fame!' : 'Keep up the great work!';
  
  return `${userCount} ${userCount === 1 ? 'employee' : 'employees'} currently ranked. ${periodText}`;
}
