'use client';

import { useMemo, useState } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications } from '@/hooks/tanstack/queries/notificationQueries';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '@/hooks/tanstack/mutations/notificationMutations';
import { NotificationItemCard } from './notification-item';
import { cn } from '@/lib/utils';

interface NotificationsPopoverProps {
  triggerClassName?: string;
  iconClassName?: string;
  badgeClassName?: string;
  popoverContentClassName?: string;
}

export function NotificationsPopover({
  triggerClassName,
  iconClassName,
  badgeClassName,
  popoverContentClassName,
}: NotificationsPopoverProps = {}) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { data, isLoading, isFetching } = useNotifications(false);
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();

  const notifications = data ?? [];

  const { unreadNotifications, readNotifications, unreadCount } = useMemo(() => {
    const unread = notifications.filter((n) => !n.readAt);
    const read = notifications.filter((n) => n.readAt);
    return {
      unreadNotifications: unread,
      readNotifications: read,
      unreadCount: unread.length,
    };
  }, [notifications]);

  const displayNotifications = filter === 'unread' ? unreadNotifications : notifications;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative size-12 rounded-full wood-panel shadow-sm hover:border-primary/40 hover:text-accent-secondary hover:scale-103 transition-all duration-300 ease-in-out',
            unreadCount > 0 ? 'text-card' : 'text-muted',
            triggerClassName
          )}
        >
          <Bell className={cn('size-4.5', iconClassName)} />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -right-2 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold leading-none text-white',
                badgeClassName
              )}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className={cn(
          'w-95 overflow-hidden rounded-xl p-0 wood-panel text-card shadow-[0_10px_28px_rgba(32,20,10,0.45)]',
          popoverContentClassName
        )}
      >
        <div className="border-b border-card/20 bg-black/5 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-accent-secondary">Message Board</p>
              <p className="text-xs text-card/70">Stay updated on your activity</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-card/70 bg-wood-light shadow-sm border border-wood hover:bg-card/10 hover:text-accent-secondary"
              onClick={() => markAllNotificationsRead.mutate()}
              disabled={markAllNotificationsRead.isPending || unreadCount === 0}
            >
              {markAllNotificationsRead.isPending ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <CheckCheck className="mr-2 h-4 w-4" />
              )}
              Mark all read
            </Button>
          </div>
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as 'all' | 'unread')}
            className="w-full"
          >
            <TabsList className="grid h-9 w-full grid-cols-2 gap-2 border border-accent/55 bg-black/10 p-1">
              <TabsTrigger
                value="all"
                className="text-xs font-semibold text-card/75 data-[state=inactive]:hover:bg-card/25 data-[state=active]:bg-accent data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                All {notifications.length > 0 && `(${notifications.length})`}
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="text-xs font-semibold text-card/75 data-[state=inactive]:hover:bg-card/25 data-[state=active]:bg-accent data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="h-90 scrollbar-hide bg-black/10">
          <ScrollArea className="h-full pl-2 pr-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-sm text-card/75">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading notifications...
              </div>
            ) : displayNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-card/75">
                <Bell className="h-5 w-5" />
                <p className="text-sm font-semibold text-card">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <p className="text-xs">
                  {filter === 'unread'
                    ? "You're all caught up!"
                    : 'You will see task, badge, and reward updates here.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 py-3">
                {filter === 'all' && unreadNotifications.length > 0 && (
                  <>
                    <div className="px-3 py-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-accent-secondary">
                        Unread ({unreadNotifications.length})
                      </p>
                    </div>
                    {unreadNotifications.map((notification) => (
                      <NotificationItemCard
                        key={notification.id}
                        notification={notification}
                        onMarkRead={() => {
                          if (!markNotificationRead.isPending) {
                            markNotificationRead.mutate(notification.id);
                          }
                        }}
                      />
                    ))}
                  </>
                )}
                {filter === 'all' && readNotifications.length > 0 && (
                  <>
                    <div className="px-3 py-1 mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-card/65">
                        Read ({readNotifications.length})
                      </p>
                    </div>
                    {readNotifications.map((notification) => (
                      <NotificationItemCard
                        key={notification.id}
                        notification={notification}
                        onMarkRead={() => {}}
                      />
                    ))}
                  </>
                )}
                {filter === 'unread' &&
                  unreadNotifications.map((notification) => (
                    <NotificationItemCard
                      key={notification.id}
                      notification={notification}
                      onMarkRead={() => {
                        if (!markNotificationRead.isPending) {
                          markNotificationRead.mutate(notification.id);
                        }
                      }}
                    />
                  ))}
                {isFetching && (
                  <div className="flex items-center gap-2 px-3 pb-2 text-xs text-card/70">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Refreshing...
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
