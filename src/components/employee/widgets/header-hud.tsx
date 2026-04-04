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
        'flex min-h-20 w-full flex-col gap-2 overflow-x-hidden px-2 sm:px-3 lg:flex-row lg:items-center lg:justify-start lg:gap-3 lg:pl-2 lg:pr-20',
        className
      )}
    >
      <div className="flex w-full min-w-0 items-stretch gap-2 lg:w-auto lg:flex-none lg:items-center lg:gap-3">
        <div className="min-w-0 flex-[1.25] font-jersey lg:min-w-fit lg:flex-none">
          <XPProgress />
        </div>

        <div className="min-w-0 flex-1 font-jersey lg:min-w-fit lg:flex-none">
          <PointsCardWidget />
        </div>
      </div>

      <div className="ml-auto flex w-full items-center justify-end gap-2 px-0.5 py-1 sm:gap-2.5 lg:w-auto lg:px-0 lg:py-0">
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
