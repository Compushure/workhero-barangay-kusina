/**
 * Test scope: Unit tests for employee notification server actions and notification action handlers.
 * Run this file only: npm test -- --runTestsByPath __tests___/unit/employee/notifications.test.ts
 */

import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  expectedNotifications,
  notificationRows,
} from '../../mockData/employeeNotificationMockData';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/actions/employee/notifications';
import {
  handleFetchNotifications,
  handleMarkAllNotificationsRead,
  handleMarkNotificationRead,
} from '@/action-handlers/employee/notifications';

let mockSupabaseClient: any;

const createClientMock = jest.fn(async () => mockSupabaseClient);
const toastSuccess = jest.fn();
const toastError = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => createClientMock(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

// Mimics the chained select query used for notification reads.
function createSelectBuilder(result: { data: any; error: { message: string } | null }) {
  const builder: any = {
    eq: jest.fn(() => builder),
    is: jest.fn(() => builder),
    order: jest.fn(() => builder),
    then: (resolve: (value: unknown) => unknown) => resolve(result),
  };

  return builder;
}

// Mimics the chained update query used for notification read-state updates.
function createUpdateBuilder(result: { error: { message: string } | null }) {
  const builder: any = {
    eq: jest.fn(() => builder),
    is: jest.fn(() => builder),
    then: (resolve: (value: unknown) => unknown) => resolve(result),
  };

  return builder;
}

// Creates a mocked notification client with controllable auth, fetch, and update outcomes.
function createNotificationClient(overrides?: {
  authUser?: { id: string; email: string } | null;
  authError?: { message: string } | null;
  fetchResult?: { data: any; error: { message: string } | null };
  updateResult?: { error: { message: string } | null };
}) {
  return {
    auth: {
      getUser: jest.fn(async () => ({
        data: { user: overrides?.authUser === undefined ? { id: 'employee-1', email: 'employee@example.com' } : overrides.authUser },
        error: overrides?.authError || null,
      })),
    },
    from: jest.fn((table: string) => {
      if (table !== 'Notification') {
        throw new Error(`Unexpected table ${table}`);
      }

      return {
        select: jest.fn(() =>
          createSelectBuilder(
            overrides?.fetchResult || {
              data: notificationRows,
              error: null,
            }
          )
        ),
        update: jest.fn(() =>
          createUpdateBuilder(
            overrides?.updateResult || {
              error: null,
            }
          )
        ),
      };
    }),
  };
}

beforeEach(() => {
  // Clear shared mock state before each notification scenario.
  toastSuccess.mockReset();
  toastError.mockReset();
  createClientMock.mockClear();
  mockSupabaseClient = createNotificationClient();
});

describe('When the employee opens the notifications list', () => {
  test('Then the fetchNotifications action returns normalized notification items', async () => {
    const result = await fetchNotifications();

    expect(result.error).toBeNull();
    expect(result.data).toEqual(expectedNotifications);
  });

  test('Then the fetchNotifications action stops when the employee is not authenticated', async () => {
    mockSupabaseClient = createNotificationClient({
      authUser: null,
    });

    const result = await fetchNotifications();

    expect(result.error).toBe('Not authenticated');
  });

  test('Then the handleFetchNotifications handler forwards the action error without showing a toast', async () => {
    const actionSpy = jest
      .spyOn(await import('@/actions/employee/notifications'), 'fetchNotifications')
      .mockResolvedValueOnce({ error: 'Failed to load notifications' });

    const result = await handleFetchNotifications(true);

    expect(result).toEqual({ error: 'Failed to load notifications' });
    expect(toastError).not.toHaveBeenCalled();
    actionSpy.mockRestore();
  });
});

describe('When the employee marks a single notification as read', () => {
  test('Then the markNotificationRead action updates the current notification row', async () => {
    const result = await markNotificationRead(notificationRows[0].id);

    expect(result.error).toBeNull();
    expect(result.data).toBe(true);
  });

  test('Then the handleMarkNotificationRead handler returns an error and shows a toast when the action fails', async () => {
    const actionSpy = jest
      .spyOn(await import('@/actions/employee/notifications'), 'markNotificationRead')
      .mockResolvedValueOnce({ error: 'Failed to mark notification as read' });

    const result = await handleMarkNotificationRead(notificationRows[0].id);

    expect(result.error).toBe('Failed to mark notification as read');
    expect(toastError).toHaveBeenCalledWith('Failed to mark notification as read');
    actionSpy.mockRestore();
  });
});

describe('When the employee marks all notifications as read', () => {
  test('Then the markAllNotificationsRead action updates every unread notification for the current employee', async () => {
    const result = await markAllNotificationsRead();

    expect(result.error).toBeNull();
    expect(result.data).toBe(true);
  });

  test('Then the handleMarkAllNotificationsRead handler shows a success toast after the action succeeds', async () => {
    const actionSpy = jest
      .spyOn(await import('@/actions/employee/notifications'), 'markAllNotificationsRead')
      .mockResolvedValueOnce({ error: null, data: true });

    const result = await handleMarkAllNotificationsRead();

    expect(result).toEqual({ error: null, data: true });
    expect(toastSuccess).toHaveBeenCalledWith('Notifications cleared');
    actionSpy.mockRestore();
  });
});
