'use client';

import { usePathname } from 'next/navigation';
import { LogOutBtn } from '@/components/employee/attendance/logout';

interface ConditionalLogoutProps {
  hideOnMercado?: boolean;
}

export function ConditionalLogout({ hideOnMercado = false }: ConditionalLogoutProps) {
  const pathname = usePathname();

  if (hideOnMercado && pathname.startsWith('/employee/mercado')) {
    return null;
  }

  return <LogOutBtn />;
}
