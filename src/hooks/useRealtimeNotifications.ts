'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { NotificationItem } from '@/types';

function mapNotificationRow(row: any): NotificationItem {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    message: row.message,
    metadata: row.metadata ?? null,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export function useRealtimeNotifications(userId: string | null) {
  const supabase = useMemo(() => createClient(), []);
  const [newNotification, setNewNotification] = useState<NotificationItem | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Notification',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNewNotification(mapNotificationRow(payload.new));
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  const clearNotification = () => setNewNotification(null);

  return { newNotification, clearNotification, isConnected };
}
