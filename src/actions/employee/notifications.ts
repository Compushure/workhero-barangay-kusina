'use server';

// (*/ω＼*)☆*: .｡. o(≧▽≦)o .｡.:*☆(❁´◡`❁)(●'◡'●)
import { createClient } from '@/lib/supabase/server';
import type { NotificationItem, ServerActionResponse } from '@/types';

// this is just a hlper fucntion that utilizes a specific return type 
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

// this is basically when you're fetching notifications
// there are two types of messages, which are unread and read
// this paramaters he r e unread only is fetching based on a bool condition
// good kay mara sepeartion sa front end bi
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

    // unread lng na kung wla read_at
  if (unreadOnly) {
    query = query.is('read_at', null);
  }

  // will alsways show descending ord lateest na  (based on when it was sent out from a trigger function
  // kung read at will be ascending meaning in order of being read, mimics most natural systems )
  const { data, error } = await query
    .order('read_at', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    return { error: `Failed to fetch notifications: ${error.message}`, data: undefined };
  }

  return { error: null, data: (data || []).map(mapNotificationRow) };
}

// amo man lng ni actually ang du critical gid na may ara date of marking read
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

  // btw gina update lng ni ang wla pa na sang read_at na column
  // this sis the correct bhavior instead o overriding previous read ns
  
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
