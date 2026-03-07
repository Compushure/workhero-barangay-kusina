'use client';

import { usePathname } from 'next/navigation';
import { NotificationsPopover } from '@/components/notifications/notifications';

interface ConditionalNotificationsProps {
  hideOnMercado?: boolean;
}

export function ConditionalNotifications({ hideOnMercado = false }: ConditionalNotificationsProps) {
  const pathname = usePathname();

  if (hideOnMercado && pathname.startsWith('/employee/mercado')) {
    return null;
  }

  return <NotificationsPopover />;
}
