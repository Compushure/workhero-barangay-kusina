'use server';

// (*/ω＼*)☆*: .｡. o(≧▽≦)o .｡.:*☆(❁´◡`❁)(●'◡'●)
import { createClient } from '@/lib/supabase/server';
import type { NotificationItem, ServerActionResponse } from '@/types';

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

export async function fetchNotifications(
  unreadOnly: boolean = false
): Promise<ServerActionResponse<NotificationItem[]>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Not authenticated', data: undefined };
  }

  let query = supabase
    .from('Notification')
    .select('id, user_id, type, message, metadata, read_at, created_at')
    .eq('user_id', user.id);

  if (unreadOnly) {
    query = query.is('read_at', null);
  }

  const { data, error } = await query
    .order('read_at', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    return { error: `Failed to fetch notifications: ${error.message}`, data: undefined };
  }

  return { error: null, data: (data || []).map(mapNotificationRow) };
}

export async function markNotificationRead(
  notificationId: string
): Promise<ServerActionResponse<boolean>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Not authenticated', data: undefined };
  }

  const { error } = await supabase
    .from('Notification')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', user.id);

  if (error) {
    return { error: `Failed to mark notification as read: ${error.message}`, data: undefined };
  }

  return { error: null, data: true };
}

export async function markAllNotificationsRead(): Promise<ServerActionResponse<boolean>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Not authenticated', data: undefined };
  }

  const { error } = await supabase
    .from('Notification')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null);

  if (error) {
    return { error: `Failed to clear notifications: ${error.message}`, data: undefined };
  }

  return { error: null, data: true };
}
