/**
 * WARNING: MAKE SURE YOU HAVE THE RIGHT ENV FOR THE TEST DB DIOS MIOKO
 * Test scope: Remote integration tests for employee notification actions and notification action handlers.
 * Run this file only: npm test -- --runTestsByPath __tests___/integration/employee/notifications.integration.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  handleFetchNotifications,
  handleMarkAllNotificationsRead,
  handleMarkNotificationRead,
} from '@/action-handlers/employee/notifications';
import { RemoteSupabaseTestContext } from '../../utils/remoteSupabaseTestUtils';

let currentServerClient: any;

const toastSuccess = jest.fn();
const toastError = jest.fn();
const remoteContext = new RemoteSupabaseTestContext('employee-notifications');

jest.setTimeout(90000);

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => currentServerClient),
}));

jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

beforeEach(() => {
  // Reset toast assertions for each remote notification scenario.
  toastSuccess.mockReset();
  toastError.mockReset();
});

afterEach(async () => {
  // Remove seeded notifications and users after each remote test.
  await remoteContext.cleanup();
});

describe('When the employee reads their remote notifications', () => {
  test('Then the handleFetchNotifications handler returns only the seeded notifications for the authenticated employee', async () => {
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Notification Employee',
      emailPrefix: 'notification.employee',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const otherEmployee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Other Notification Employee',
      emailPrefix: 'notification.other.employee',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });

    await remoteContext.seedNotification({
      userId: employee.id,
      type: 'task',
      message: 'Unread remote notification',
    });
    await remoteContext.seedNotification({
      userId: employee.id,
      type: 'badge',
      message: 'Already read remote notification',
      readAt: new Date().toISOString(),
    });
    await remoteContext.seedNotification({
      userId: otherEmployee.id,
      type: 'reward',
      message: 'Other employee notification',
    });

    currentServerClient = remoteContext.createServerClientForUser(employee);

    const allNotifications = await handleFetchNotifications(false);
    const unreadNotifications = await handleFetchNotifications(true);

    expect(allNotifications.error).toBeNull();
    expect(allNotifications.data).toHaveLength(2);
    expect(unreadNotifications.error).toBeNull();
    expect(unreadNotifications.data).toHaveLength(1);
    expect(unreadNotifications.data?.[0].message).toBe('Unread remote notification');
  });
});

describe('When the employee marks remote notifications as read', () => {
  test('Then the handleMarkNotificationRead handler updates the selected remote notification', async () => {
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Notification Read Employee',
      emailPrefix: 'notification.read.employee',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });
    const seededNotification = await remoteContext.seedNotification({
      userId: employee.id,
      type: 'task',
      message: 'Needs to be marked as read',
    });

    currentServerClient = remoteContext.createServerClientForUser(employee);

    const handlerResult = await handleMarkNotificationRead(seededNotification.id);
    const { data: updatedNotification, error } = await remoteContext.admin
      .from('Notification')
      .select('read_at')
      .eq('id', seededNotification.id)
      .single();

    expect(handlerResult).toEqual({ error: null, data: true });
    expect(error).toBeNull();
    expect(updatedNotification?.read_at).toBeTruthy();
  });

  test('Then the handleMarkAllNotificationsRead handler updates every unread remote notification for the employee', async () => {
    const employee = await remoteContext.seedUser({
      roleType: 'regular',
      namePrefix: 'Notification Clear Employee',
      emailPrefix: 'notification.clear.employee',
      points: 0,
      xp: 0,
      totalPointsEarned: 0,
    });

    await remoteContext.seedNotification({
      userId: employee.id,
      type: 'task',
      message: 'Unread notification one',
    });
    await remoteContext.seedNotification({
      userId: employee.id,
      type: 'badge',
      message: 'Unread notification two',
    });

    currentServerClient = remoteContext.createServerClientForUser(employee);

    const handlerResult = await handleMarkAllNotificationsRead();
    const { data: notifications, error } = await remoteContext.admin
      .from('Notification')
      .select('id, read_at')
      .eq('user_id', employee.id);

    expect(handlerResult).toEqual({ error: null, data: true });
    expect(error).toBeNull();
    expect(notifications?.every((notification) => notification.read_at)).toBe(true);
    expect(toastSuccess).toHaveBeenCalledWith('Notifications cleared');
  });
});
