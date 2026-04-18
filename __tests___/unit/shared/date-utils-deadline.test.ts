import { afterAll, beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { isTaskOverdue, toManilaDeadlineISOString } from '@/utils/date-utils';

describe('Task deadline timezone helpers', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.setSystemTime(new Date('2026-04-05T10:00:00+08:00'));
  });

  test('normalizes date-only values to 11:59:59.999 PM Asia/Manila', () => {
    expect(toManilaDeadlineISOString('2026-04-05')).toBe('2026-04-05T15:59:59.999Z');
  });

  test('normalizes Date values to 11:59:59.999 PM Asia/Manila for the selected day', () => {
    const selectedDay = new Date(Date.UTC(2026, 3, 5, 12, 0, 0, 0));
    expect(toManilaDeadlineISOString(selectedDay)).toBe('2026-04-05T15:59:59.999Z');
  });

  test('marks tasks overdue only after the next Manila midnight', () => {
    jest.setSystemTime(new Date('2026-04-05T23:59:59+08:00'));
    expect(isTaskOverdue('2026-04-05')).toBe(false);

    jest.setSystemTime(new Date('2026-04-06T00:00:00+08:00'));
    expect(isTaskOverdue('2026-04-05')).toBe(true);
  });
});
