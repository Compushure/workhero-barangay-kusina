import type { Reward } from '@/types';
import type { MercadoInterval } from './mercado-context';

export type IntervalCountMap = Record<MercadoInterval, number>;
export type IntervalClosedMap = Record<MercadoInterval, boolean>;

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
  const hasAnyIntervalItem = allRewards.some((reward) => reward.availableMonth === interval);
  const hasVisibleIntervalItem = allRewards.some(
    (reward) => reward.availableMonth === interval && reward.isActive
  );

  const hiddenOnly = hasAnyIntervalItem && !hasVisibleIntervalItem;
  const noAvailableItems = availableCount === 0;

  return hiddenOnly || noAvailableItems;
}

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
