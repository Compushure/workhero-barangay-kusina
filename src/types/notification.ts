export type NotificationType = 'badge' | 'user' | 'task' | 'reward';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  metadata?: Record<string, unknown> | null;
  readAt?: string | null;
  createdAt: string;
}
