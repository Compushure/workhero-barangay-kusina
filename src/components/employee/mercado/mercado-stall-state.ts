import type { Reward } from '@/types';
import type { MercadoInterval } from './mercado-context';

export type IntervalCountMap = Record<MercadoInterval, number>;
export type IntervalClosedMap = Record<MercadoInterval, boolean>;

// Normalize raw interval counts into a strongly typed map.
export function buildIntervalCounts(input: {
  weekly: number;
  monthly: number;
  yearly: number;
}): IntervalCountMap {
  return {
    weekly: input.weekly,
    monthly: input.monthly,
    yearly: input.yearly,
  };
}

export function isIntervalClosed(
  interval: MercadoInterval,
  allRewards: Reward[],
  availableCount: number
): boolean {
  // Any item assigned to this interval, even hidden/inactive.
  const hasAnyIntervalItem = allRewards.some((reward) => reward.availableMonth === interval);
  // Visible item assigned to this interval.
  const hasVisibleIntervalItem = allRewards.some(
    (reward) => reward.availableMonth === interval && reward.isActive
  );

  // Closed when interval has items but all are hidden/inactive.
  const hiddenOnly = hasAnyIntervalItem && !hasVisibleIntervalItem;
  // Closed when query returns no currently available items.
  const noAvailableItems = availableCount === 0;

  return hiddenOnly || noAvailableItems;
}

// Build closed/open state for each interval in one place for UI consumption.
export function buildClosedByInterval(
  allRewards: Reward[],
  availableCounts: IntervalCountMap
): IntervalClosedMap {
  return {
    weekly: isIntervalClosed('weekly', allRewards, availableCounts.weekly),
    monthly: isIntervalClosed('monthly', allRewards, availableCounts.monthly),
    yearly: isIntervalClosed('yearly', allRewards, availableCounts.yearly),
  };
}
