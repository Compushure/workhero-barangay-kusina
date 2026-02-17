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
