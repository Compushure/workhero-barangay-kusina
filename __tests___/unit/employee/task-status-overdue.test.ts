import { afterAll, beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { isTaskStatusItemOverdue } from '@/components/employee/task-status/task-status-utils';

describe('Employee task status overdue boundary', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.setSystemTime(new Date('2026-04-05T10:00:00+08:00'));
  });

  test('returns false for incomplete tasks before Manila midnight of next day', () => {
    const task = {
      dueDate: '2026-04-05',
      completedOrders: 1,
      maxOrders: 3,
    };

    jest.setSystemTime(new Date('2026-04-05T23:59:59+08:00'));
    expect(isTaskStatusItemOverdue(task)).toBe(false);
  });

  test('returns true for incomplete tasks starting Manila midnight of next day', () => {
    const task = {
      dueDate: '2026-04-05',
      completedOrders: 1,
      maxOrders: 3,
    };

    jest.setSystemTime(new Date('2026-04-06T00:00:00+08:00'));
    expect(isTaskStatusItemOverdue(task)).toBe(true);
  });

  test('returns false for completed tasks even after overdue boundary', () => {
    const task = {
      dueDate: '2026-04-05',
      completedOrders: 3,
      maxOrders: 3,
    };

    jest.setSystemTime(new Date('2026-04-06T00:00:00+08:00'));
    expect(isTaskStatusItemOverdue(task)).toBe(false);
  });
});
