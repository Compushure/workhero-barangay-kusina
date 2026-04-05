'use client';

import { usePathname } from 'next/navigation';
import { NotificationsPopover } from '@/components/notifications/notifications';

interface ConditionalNotificationsProps {
  hideOnMercado?: boolean;
  triggerClassName?: string;
  popoverSide?: 'top' | 'right' | 'bottom' | 'left';
  popoverAlign?: 'start' | 'center' | 'end';
  popoverCollisionPadding?: number | { top?: number; right?: number; bottom?: number; left?: number };
  popoverSideOffset?: number;
  popoverAlignOffset?: number;
  popoverContentClassName?: string;
}

export function ConditionalNotifications({
  hideOnMercado = false,
  triggerClassName,
  popoverSide,
  popoverAlign,
  popoverCollisionPadding,
  popoverSideOffset,
  popoverAlignOffset,
  popoverContentClassName,
}: ConditionalNotificationsProps) {
  const pathname = usePathname();

  if (hideOnMercado && pathname.startsWith('/employee/mercado')) {
    return null;
  }

  return (
    <NotificationsPopover
      triggerClassName={triggerClassName}
      popoverSide={popoverSide}
      popoverAlign={popoverAlign}
      popoverCollisionPadding={popoverCollisionPadding}
      popoverSideOffset={popoverSideOffset}
      popoverAlignOffset={popoverAlignOffset}
      popoverContentClassName={popoverContentClassName}
    />
  );
}
