import { differenceInCalendarDays } from 'date-fns';
import { describe, expect, jest, test, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { hasItemPassedAvailabilityInterval } from '@/utils/date-utils';
import { getISOWeekDateRange, toManilaDateString } from '@/lib/utils/time-period-utils';

describe('Mercado interval helpers', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.setSystemTime(new Date('2026-04-05T10:00:00+08:00'));
  });

  test('marks weekly items as expired after Saturday', () => {
    jest.setSystemTime(new Date('2026-04-04T10:00:00+08:00'));
    expect(
      hasItemPassedAvailabilityInterval(new Date('2026-03-30T00:00:00+08:00'), 'weekly')
    ).toBe(false);

    jest.setSystemTime(new Date('2026-04-05T10:00:00+08:00'));
    expect(
      hasItemPassedAvailabilityInterval(new Date('2026-03-30T00:00:00+08:00'), 'weekly')
    ).toBe(true);
  });

  test('weekly date ranges span Monday through Saturday', () => {
    const { start, end } = getISOWeekDateRange(2026, 14);

    expect(differenceInCalendarDays(end, start)).toBe(5);
    expect(toManilaDateString(start)).toBe('2026-03-30');
    expect(toManilaDateString(end)).toBe('2026-04-04');
  });
});