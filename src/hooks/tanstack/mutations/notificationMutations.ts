//optimistic cache updates (setQueryData) 
//invalidate queries (invalidateQueries) to ensure the cache is refreshed
import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import {
  handleMarkAllNotificationsRead,
  handleMarkNotificationRead,
} from '@/action-handlers/employee/notifications';
import type { NotificationItem } from '@/types';
import { notificationKeys } from '../queries/notificationQueries';

export function useMarkNotificationRead(): UseMutationResult<boolean, Error, string> {
  const queryClient = useQueryClient();
// mutationFn → Calls the server to mark a single notification as read. Throws an error if it fails.

// onSuccess → Updates the cache directly:
// Adds a readAt timestamp to the notification in the “all notifications” list.
// Removes the notification from the “unread notifications” list.
// onSettled → Invalidates all notification queries so they refetch and stay consistent.
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const result = await handleMarkNotificationRead(notificationId);
      if (!result?.data) {
        throw new Error(result?.error || 'Failed to mark notification as read');
      }
      return true;
    },
    onSuccess: (_data, notificationId) => {
      const now = new Date().toISOString();

      // updates cache directly
      queryClient.setQueryData<NotificationItem[]>(
        notificationKeys.list(false),
        (existing = []) =>
          existing.map((notification) =>
            notification.id === notificationId && !notification.readAt
              ? { ...notification, readAt: now }
              : notification
          )
      );

      queryClient.setQueryData<NotificationItem[]>(
        notificationKeys.list(true),
        (existing = []) => existing.filter((notification) => notification.id !== notificationId)
      );
    },
    onSettled: () => {
      // invalidates all query afterr settled
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}


//mutationFn → Calls the server to mark all notifications as read. Throws an error if it fails.

// onSuccess → Updates the cache directly:
// Sets readAt for every notification in the “all notifications” list.
// Clears the “unread notifications” list entirely.
// onSettled → Invalidates all notification queries so they refetch and stay consistent.
export function useMarkAllNotificationsRead(): UseMutationResult<boolean, Error, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await handleMarkAllNotificationsRead();
      if (!result?.data) {
        throw new Error(result?.error || 'Failed to clear notifications');
      }
      return true;
    },
    onSuccess: () => {
      const now = new Date().toISOString();

      queryClient.setQueryData<NotificationItem[]>(
        notificationKeys.list(false),
        (existing = []) => existing.map((notification) => ({ ...notification, readAt: notification.readAt ?? now }))
      );

      queryClient.setQueryData<NotificationItem[]>(notificationKeys.list(true), () => []);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
