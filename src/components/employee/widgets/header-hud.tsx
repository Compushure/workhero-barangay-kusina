'use client';

import { ConditionalNotifications } from '../conditional-notifications';
import XPProgress from './xp-level-widget';
import PointsCardWidget from './points-card-widget';
import { cn } from '@/lib/utils';
import { LogOutBtn } from './logout';
import { MapLauncher } from '../minimap/map-launcher';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
        'flex min-h-24 w-full items-center justify-start gap-2 sm:gap-3 overflow-x-hidden px-2 sm:pl-6 sm:pr-24 sticky',
        className
      )}
    >
      <div className="shrink-0 font-jersey">
        <XPProgress />
      </div>

      <div className="shrink-0 font-jersey">
        <PointsCardWidget />
      </div>

      <div className="shrink-0 ml-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex">
              <ConditionalNotifications hideOnMercado={hideNotificationsOnMercado} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            Notifications
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex">
              <MapLauncher inline />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            Navigation Map
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex">
              <LogOutBtn
                iconOnly
                requireConfirmation
                className="wood-panel text-card hover:text-accent-secondary"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            Logout
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
