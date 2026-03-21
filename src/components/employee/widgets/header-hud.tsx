'use client';

import { ConditionalNotifications } from '../conditional-notifications';
import XPProgress from './xp-level-widget';
import ProfileLevelCard from './profile-widget';
import PointsCardWidget from './points-card-widget';
import { cn } from '@/lib/utils';

interface HeaderHUDProps {
  className?: string;
  hideNotificationsOnMercado?: boolean;
}

export default function HeaderHUD({
  className,
  hideNotificationsOnMercado = true,
}: HeaderHUDProps) {
  return (
    <div
      className={cn(
        'flex min-h-24 w-full items-center gap-3 overflow-x-auto px-5 font-jersey sticky',
        className
      )}
    >
      <div className="shrink-0">
        <XPProgress />
      </div>

      <div className="min-w-0 flex-1">
        <PointsCardWidget />
      </div>

      <div className="shrink-0">
        <ConditionalNotifications hideOnMercado={hideNotificationsOnMercado} />
      </div>

      <div className="shrink-0">
        <ProfileLevelCard />
      </div>
    </div>
  );
}
