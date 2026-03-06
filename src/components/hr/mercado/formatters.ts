export type AvailabilityInterval = 'weekly' | 'monthly' | 'yearly';

export type AvailabilityValue = AvailabilityInterval | number | null | undefined;

export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return '0';
  return value.toLocaleString('en-US');
}

export function formatDateShort(
  value: string | Date | null | undefined,
  fallback = 'N/A'
): string {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatAvailabilityLabel(value: AvailabilityValue): string {
  if (value === 'weekly') return 'Weekly';
  if (value === 'monthly') return 'Monthly';
  if (value === 'yearly') return 'Yearly';

  if (typeof value === 'number' && value >= 1 && value <= 12) {
    return new Date(2026, value - 1, 1).toLocaleDateString('en-US', {
      month: 'long',
    });
  }

  return 'Always Available';
}
