import { Check, Clock3, Dot } from 'lucide-react';

import type { NotificationItem } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationItemCardProps {
  notification: NotificationItem;
  onMarkRead?: () => void;
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Just now';

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatStatus(status: string): string {
  return status
    .replace(/[_-]/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function deriveNotificationStatus(notification: NotificationItem): string | undefined {
  const metadata = notification.metadata as Record<string, unknown> | null;
  const rawStatus = metadata?.status;

  if (typeof rawStatus === 'string' && rawStatus.trim()) {
    return rawStatus;
  }

  if (notification.type !== 'task') {
    return undefined;
  }

  const message = notification.message.toLowerCase();
  if (message.includes('assigned')) return 'assigned';
  if (message.includes('review')) return 'in review';
  if (message.includes('approved')) return 'approved';
  if (message.includes('rejected')) return 'rejected';
  if (message.includes('complete') || message.includes('completed')) return 'completed';

  return undefined;
}

export function NotificationItemCard({ notification, onMarkRead }: NotificationItemCardProps) {
  const isUnread = !notification.readAt;
  const status = deriveNotificationStatus(notification);

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border border-border/70 bg-white px-3 py-2.5 shadow-sm transition hover:border-primary/50',
        isUnread ? 'bg-primary/5' : 'bg-muted'
      )}
    >
      <Dot className={cn('mt-1 h-5 w-5 text-muted-foreground', isUnread && 'text-primary')} />
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          <span className="font-semibold text-foreground">{notification.type}</span>
          {status ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
              {formatStatus(status)}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-foreground">{notification.message}</p>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Clock3 className="h-3.5 w-3.5" />
          <span>{formatTimestamp(notification.createdAt)}</span>
        </div>
      </div>
      {isUnread ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          onClick={onMarkRead}
        >
          <Check className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
