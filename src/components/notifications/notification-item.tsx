import { Check, Clock3, Dot } from 'lucide-react';

import type { NotificationItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
        'group flex items-start gap-3 rounded-lg border px-3 py-2.5 font-jersey tracking-wide subpixel-antialiased [-webkit-font-smoothing:auto] [text-rendering:geometricPrecision] shadow-sm transition',
        isUnread
          ? 'border-accent-secondary/50 bg-card/12 hover:border-accent-secondary/75'
          : 'border-card/20 bg-card/5 hover:border-accent/45'
      )}
    >
      <Dot className={cn('mt-1 h-5 w-5 text-card/65', isUnread && 'text-accent-secondary')} />
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-card">
          <span className="font-medium text-accent-secondary">{notification.type}</span>
          {status ? (
            <span className="rounded-full border border-accent/45 bg-black/10 px-2 py-0.5 text-[0.75rem] tracking-wider font-medium text-card">
              {formatStatus(status)}
            </span>
          ) : null}
        </div>
        <p className="text-xs text-card">{notification.message}</p>
        <div className="flex items-center gap-2 text-xs text-card/85">
          <Clock3 className="h-3.5 w-3.5" />
          <span>{formatTimestamp(notification.createdAt)}</span>
        </div>
      </div>
      {isUnread ? (
        <TooltipProvider delayDuration={120}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-card bg-wood-light border border-wood shadow-sm/25 hover:bg-accent/80 duration-300 transition-all ease-in-out"
                onClick={onMarkRead}
              >
                <Check className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              mark as read
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
    </div>
  );
}
