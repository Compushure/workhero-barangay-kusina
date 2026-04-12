import { differenceInCalendarDays } from 'date-fns';
import { describe, expect, jest, test, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { hasItemPassedAvailabilityInterval } from '@/utils/date-utils';
import { getISOWeekDateRange, toManilaDateString } from '@/lib/utils/time-period-utils';

// Ensures weekly time-window rules match Mercado business schedule.

describe('Mercado interval helpers', () => {
  // Freeze time so date logic is deterministic in every run.
  beforeAll(() => {
    jest.useFakeTimers();
  });

  // Restore real clock after this suite finishes.
  afterAll(() => {
    jest.useRealTimers();
  });

  // Default "today" used by tests unless a test overrides it.
  beforeEach(() => {
    jest.setSystemTime(new Date('2026-04-05T10:00:00+08:00'));
  });

  test('marks weekly items as expired after Saturday', () => {
    // Saturday is still inside the current weekly Mercado window.
    jest.setSystemTime(new Date('2026-04-04T10:00:00+08:00'));
    expect(
      hasItemPassedAvailabilityInterval(new Date('2026-03-30T00:00:00+08:00'), 'weekly')
    ).toBe(false);

    // Sunday should mark the same weekly item as expired.
    jest.setSystemTime(new Date('2026-04-05T10:00:00+08:00'));
    expect(
      hasItemPassedAvailabilityInterval(new Date('2026-03-30T00:00:00+08:00'), 'weekly')
    ).toBe(true);
  });

  test('weekly date ranges span Monday through Saturday', () => {
    // Week 14 of 2026 should return a 6-day window (Mon-Sat).
    const { start, end } = getISOWeekDateRange(2026, 14);

    expect(differenceInCalendarDays(end, start)).toBe(5);
    expect(toManilaDateString(start)).toBe('2026-03-30');
    expect(toManilaDateString(end)).toBe('2026-04-04');
  });
});