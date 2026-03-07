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
          className={cn(
            'relative h-14 w-14 rounded-full bg-[#6F4C2E] cursor-pointer border-3 border-[#47331F] text-[#F4B925] shadow-[4px_4px_0px_#000] shadow-[#47331F]/50 transition-transform hover:scale-105 hover:bg-[#6F4C2E] hover:text-[#F4B925] hover:border-[#47331F] flex items-center justify-center',
            unreadCount > 0 ? 'text-[#F4B925]' : 'text-[#F4B925]'
          )}
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold leading-none text-white',
                badgeClassName
              )}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className={cn('w-95 p-0 shadow-lg', popoverContentClassName)}>
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold">Notifications</p>
              <p className="text-xs text-muted-foreground">Stay updated on your activity</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs"
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all" className="text-xs">
                All {notifications.length > 0 && `(${notifications.length})`}
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="h-90 scrollbar-hide">
          <ScrollArea className="h-full px-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading notifications...
              </div>
            ) : displayNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
                <Bell className="h-5 w-5" />
                <p className="text-sm font-medium">
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
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                  <div className="flex items-center gap-2 px-3 pb-2 text-xs text-muted-foreground">
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
