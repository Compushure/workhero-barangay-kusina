'use client';

import { usePathname } from 'next/navigation';
import { MapLauncher } from '@/components/employee/minimap/map-launcher';

interface ConditionalMapLauncherProps {
  hideOnMercado?: boolean;
}

export function ConditionalMapLauncher({ hideOnMercado = false }: ConditionalMapLauncherProps) {
  const pathname = usePathname();

  if (hideOnMercado && pathname.startsWith('/employee/mercado')) {
    return null;
  }

  return <MapLauncher />;
}
