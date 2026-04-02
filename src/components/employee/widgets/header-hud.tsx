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
        'flex min-h-20 w-full flex-col gap-2 overflow-x-hidden px-2 sm:flex-row sm:items-center sm:justify-start sm:gap-3 sm:pl-2 sm:pr-20',
        className
      )}
    >
      <div className="flex w-full min-w-0 items-stretch gap-2 sm:w-auto sm:flex-none sm:items-center sm:gap-3">
        <div className="min-w-0 flex-[1.25] font-jersey sm:min-w-fit sm:flex-none">
          <XPProgress />
        </div>

        <div className="min-w-0 flex-1 font-jersey sm:min-w-fit sm:flex-none">
          <PointsCardWidget />
        </div>
      </div>

      <div className="ml-auto flex w-full items-center justify-end gap-2 px-1.5 py-1 sm:w-auto sm:px-0 sm:py-0">
        <div className="shrink-0">
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
    </div>
  );
}
