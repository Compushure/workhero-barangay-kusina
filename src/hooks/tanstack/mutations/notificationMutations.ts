import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import {
  handleMarkAllNotificationsRead,
  handleMarkNotificationRead,
} from '@/action-handlers/employee/notifications';
import type { NotificationItem } from '@/types';
import { notificationKeys } from '../queries/notificationQueries';

export function useMarkNotificationRead(): UseMutationResult<boolean, Error, string> {
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

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
