import { toast } from 'sonner';

import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/actions/employee/notifications';
import { safeAction } from '@/lib/utils/safe-action';
import type { NotificationItem } from '@/types';

export async function handleFetchNotifications(
  unreadOnly: boolean = false
): Promise<{ error: string | null; data?: NotificationItem[] }> {
  const result = await safeAction(() => fetchNotifications(unreadOnly));

  if (!result.success || result.data?.error) {
    return {
      error: result.error || result.data?.error || 'Failed to load notifications',
    };
  }

  return { error: null, data: result.data?.data };
}

export async function handleMarkNotificationRead(
  notificationId: string
): Promise<{ error: string | null; data?: boolean }> {
  const result = await safeAction(() => markNotificationRead(notificationId));

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error || 'Failed to mark notification as read');
    return {
      error: result.error || result.data?.error || 'Failed to mark notification as read',
    };
  }

  return { error: null, data: true };
}

export async function handleMarkAllNotificationsRead(): Promise<{
  error: string | null;
  data?: boolean;
}> {
  const result = await safeAction(() => markAllNotificationsRead());

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error || 'Failed to clear notifications');
    return {
      error: result.error || result.data?.error || 'Failed to clear notifications',
    };
  }

  toast.success('Notifications cleared');
  return { error: null, data: true };
}
