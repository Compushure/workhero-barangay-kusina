import type { NotificationItem } from '@/types';

type NotificationRow = {
  id: string;
  user_id: string;
  type: NotificationItem['type'];
  message: string;
  metadata: Record<string, string>;
  read_at: string | null;
  created_at: string;
};

export const notificationRows: NotificationRow[] = [
  {
    id: 'notif-1',
    user_id: 'employee-1',
    type: 'task',
    message: 'Task approved',
    metadata: { taskId: 'task-1' },
    read_at: null,
    created_at: '2026-04-03T08:00:00.000Z',
  },
  {
    id: 'notif-2',
    user_id: 'employee-1',
    type: 'badge',
    message: 'Badge awarded',
    metadata: { badgeId: 'badge-1' },
    read_at: '2026-04-03T09:00:00.000Z',
    created_at: '2026-04-02T08:00:00.000Z',
  },
];

export const expectedNotifications: NotificationItem[] = notificationRows.map((row) => ({
  id: row.id,
  userId: row.user_id,
  type: row.type,
  message: row.message,
  metadata: row.metadata,
  readAt: row.read_at,
  createdAt: row.created_at,
}));
