import { supabaseAdmin } from '@/lib/supabase/admin';
import type { NotificationType } from '@/types';

interface NotificationPayload {
  userId: string;
  type: NotificationType;
  message: string;
  metadata?: Record<string, unknown> | null;
}

export async function insertNotification({
  userId,
  type,
  message,
  metadata,
}: NotificationPayload): Promise<void> {
  try {
    if (!userId) return;

    const { error } = await supabaseAdmin.from('Notification').insert({
      user_id: userId,
      type,
      message,
      metadata: metadata ?? null,
    });

    if (error) {
      console.error('Failed to insert notification', { error: error.message, userId, type });
    }
  } catch (error) {
    console.error('Unexpected error inserting notification', error);
  }
}
