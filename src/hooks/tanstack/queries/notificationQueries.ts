/**
 * Notification TanStack Queries
 * ==============================
 * Provides cached notification data with unread-first ordering.
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { handleFetchNotifications } from '@/action-handlers/employee/notifications';
import type { NotificationItem } from '@/types';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (unreadOnly: boolean = false) => [...notificationKeys.all, unreadOnly ? 'unread' : 'all'] as const,
} as const;

export function useNotifications(
  unreadOnly: boolean = false,
  queryOptions: { enabled?: boolean } = {}
): UseQueryResult<NotificationItem[] | null, Error> {
  return useQuery({
    queryKey: notificationKeys.list(unreadOnly),
    queryFn: async () => {
      const result = await handleFetchNotifications(unreadOnly);

      if (result.error) {
        throw new Error(result.error);
      }

      return result.data ?? [];
    },
    enabled: queryOptions.enabled !== false,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // keep fresh while user active
  }) as UseQueryResult<NotificationItem[] | null, Error>;
}
