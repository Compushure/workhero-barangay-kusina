'use client';

import { useEffect, useState } from 'react';
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
  const [isMdUp, setIsMdUp] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const updateIsMdUp = () => setIsMdUp(mediaQuery.matches);

    updateIsMdUp();
    mediaQuery.addEventListener('change', updateIsMdUp);
    return () => mediaQuery.removeEventListener('change', updateIsMdUp);
  }, []);

  const tooltipSide = isMdUp ? 'bottom' : 'left';

  return (
    <div
      className={cn(
        'flex min-h-16 w-full items-center justify-start gap-2 sm:gap-2.5 overflow-x-hidden px-2 pr-14 sm:pl-2 sm:pr-16 md:pr-20 sticky',
        className
      )}
    >
      <div className="flex w-full min-w-0 items-center gap-2 sm:gap-2.5 md:w-auto md:flex-none md:gap-3">
        <div className="min-w-0 shrink-0 font-jersey md:min-w-fit md:flex-none">
          <XPProgress />
        </div>

        <div className="min-w-0 shrink-0 font-jersey md:min-w-fit md:flex-none">
          <PointsCardWidget />
        </div>
      </div>

      <div className="drop-shadow-md/50 sm:drop-shadow-md/0 pointer-events-auto fixed right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-2 md:static md:ml-auto md:z-auto md:translate-y-0 md:flex-row md:gap-3">
        <div className="shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex">
                <ConditionalNotifications
                  hideOnMercado={hideNotificationsOnMercado}
                  triggerClassName="size-10 md:size-12"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side={tooltipSide} sideOffset={8}>
              Notifications
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex">
                <MapLauncher inline className="size-10 md:size-12" />
              </div>
            </TooltipTrigger>
            <TooltipContent side={tooltipSide} sideOffset={8}>
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
                  className="size-10 md:size-12 wood-panel text-card hover:text-accent-secondary"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side={tooltipSide} sideOffset={8}>
              Logout
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
