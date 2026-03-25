'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, CheckCircle2, Gift, User, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { cn } from '@/lib/utils';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { notificationKeys } from '@/hooks/tanstack/queries/notificationQueries';
import type { NotificationItem } from '@/types';

interface RealtimeNotificationToastClientProps {
  userId: string;
}

const ICON_BY_TYPE = {
  badge: Award,
  task: CheckCircle2,
  reward: Gift,
  user: User,
} as const;

const CARD_BY_TYPE = {
  badge: 'border-amber-400',
  task: 'border-cyan-400',
  reward: 'border-lime-400',
  user: 'border-violet-400',
} as const;

const ICON_BY_COLOR = {
  badge: 'text-amber-300',
  task: 'text-cyan-300',
  reward: 'text-lime-300',
  user: 'text-fuchsia-300',
} as const;

export function RealtimeNotificationToastClient({ userId }: RealtimeNotificationToastClientProps) {
  const queryClient = useQueryClient();
  const { newNotification, clearNotification } = useRealtimeNotifications(userId);

  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<NotificationItem | null>(null);

  useEffect(() => {
    if (!newNotification) return;

    setCurrent(newNotification);
    setVisible(true);

    queryClient.invalidateQueries({ queryKey: notificationKeys.all });

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        clearNotification();
        setCurrent(null);
      }, 250);
    }, 7000);

    return () => clearTimeout(timer);
  }, [clearNotification, newNotification, queryClient]);

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => {
      clearNotification();
      setCurrent(null);
    }, 250);
  };

  if (!current) return null;

  const Icon = ICON_BY_TYPE[current.type] ?? User;
  const cardClass = CARD_BY_TYPE[current.type] ?? CARD_BY_TYPE.user;
  const iconClass = ICON_BY_COLOR[current.type] ?? ICON_BY_COLOR.user;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-90 w-100 max-w-[calc(100vw-2rem)]"
        >
          <div
            className={cn(
              'rounded-xl border-2 p-4 shadow-xl backdrop-blur-sm bg-wood-card text-card',
              cardClass
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn('mt-0.5 p-1.5 rounded-md bg-yellow-500/15 shadow-sm/25', iconClass)}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.75rem] font-bold uppercase tracking-wide opacity-80">
                  {current.type}
                </p>
                <p className="mt-0.5 text-sm leading-snug">{current.message}</p>
              </div>
              <button
                onClick={dismiss}
                className="rounded-md p-1 opacity-70 transition hover:bg-black/10 hover:opacity-100"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
