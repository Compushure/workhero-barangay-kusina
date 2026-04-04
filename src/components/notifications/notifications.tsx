'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);
  const { data, isLoading, isFetching } = useNotifications(false);
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener('change', updateIsMobile);
    return () => mediaQuery.removeEventListener('change', updateIsMobile);
  }, []);

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
  const popoverSide = isMobile ? 'left' : 'bottom';
  const popoverAlign = isMobile ? 'start' : 'end';

  if (isLoading && notifications.length === 0) {
    return (
      <div
        className={cn(
          'relative inline-flex size-12 items-center justify-center rounded-full wood-panel shadow-sm',
          triggerClassName
        )}
        aria-hidden="true"
      >
        <div className="absolute inset-2 rounded-full bg-wood-light/70 animate-pulse" />
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative size-12 mr-0.5 rounded-full wood-panel shadow-sm hover:border-primary/40 hover:text-accent-secondary hover:scale-103 hover:cursor-pointer transition-all duration-300 ease-in-out',
            unreadCount > 0 ? 'text-card' : 'text-muted',
            triggerClassName
          )}
        >
          <Bell className={cn('size-4.5', iconClassName)} />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -right-2 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-sm font-medium leading-none text-white',
                badgeClassName
              )}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={popoverSide}
        align={popoverAlign}
        collisionPadding={isMobile ? { top: 8, bottom: 24, left: 8, right: 56 } : 8}
        className={cn(
          'w-[min(24rem,calc(100vw-4.25rem))] overflow-hidden rounded-xl p-0 wood-panel font-jersey tracking-wide text-card subpixel-antialiased [-webkit-font-smoothing:auto] [text-rendering:geometricPrecision] data-[state=open]:animate-none data-[state=closed]:animate-none shadow-[0_10px_28px_rgba(32,20,10,0.45)] md:w-105',
          popoverContentClassName
        )}
      >
        <div className="border-b border-card/20 bg-black/5 px-3 py-3 sm:px-4">
          <div className="mb-3 flex items-start justify-between gap-2 sm:items-center">
            <div>
              <p className="text-[1.25rem] text-accent-secondary leading-8">Message Board</p>
              <p className="text-[0.9rem] sm:text-xs md:text-base text-card">Stay updated on your activity</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-full sm:h-7 border border-wood bg-wood-light px-2 font-jersey text-xs tracking-wide text-card shadow-sm hover:bg-card/10 hover:text-accent-secondary"
              onClick={() => markAllNotificationsRead.mutate()}
              disabled={markAllNotificationsRead.isPending || unreadCount === 0}
            >
              {markAllNotificationsRead.isPending ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <CheckCheck className="mr-2 h-4 w-4" />
              )}
              <span className='w-12 sm:w-full text-wrap text-left text-[0.9rem] sm:text-xs'>Mark all read</span>
            </Button>
          </div>
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as 'all' | 'unread')}
            className="w-full px-2"
          >
            <TabsList className="grid h-9 w-full grid-cols-2 gap-2 border border-accent/55 bg-black/10">
              <TabsTrigger
                value="all"
                className="h-full font-jersey text-xs font-medium tracking-wide text-card data-[state=inactive]:hover:bg-card/25 data-[state=active]:bg-accent data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                All {notifications.length > 0 && `(${notifications.length})`}
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="h-full font-jersey text-xs font-medium tracking-wide text-card data-[state=inactive]:hover:bg-card/25 data-[state=active]:bg-accent data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="h-100 scrollbar-hide bg-black/10">
          <ScrollArea className="h-full pl-2 pr-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-sm text-card">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading notifications...
              </div>
            ) : displayNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-card">
                <Bell className="h-5 w-5" />
                <p className="text-sm font-medium text-card">
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
                      <p className="text-xs font-medium uppercase tracking-wider text-accent-secondary">
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
                      <p className="text-xs font-medium uppercase tracking-wider text-card/65">
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
                  <div className="flex items-center gap-2 px-3 pb-2 text-xs text-card">
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
