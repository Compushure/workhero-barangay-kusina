'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ConditionalNotifications } from '../conditional-notifications';
import XPProgress from './xp-level-widget';
import PointsCardWidget from './points-card-widget';
import { cn } from '@/lib/utils';
import { LogOutBtn } from './logout';
import { MapLauncher } from '../minimap/map-launcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HeaderHUDProps {
  className?: string;
  hideNotificationsOnMercado?: boolean;
}

export default function HeaderHUD({
  className,
  hideNotificationsOnMercado = true,
}: HeaderHUDProps) {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  return (
    <div
      className={cn(
        'flex min-h-24 w-full items-center justify-start gap-3 overflow-x-hidden px-3 sm:pl-12 sm:pr-24 sticky',
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
              <ConditionalNotifications
                hideOnMercado={hideNotificationsOnMercado}
              />
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
        <DropdownMenu open={isAccountMenuOpen} onOpenChange={setIsAccountMenuOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Open account actions"
                  className="inline-flex size-12 items-center justify-center rounded-full wood-panel text-card shadow-sm transition-all duration-300 hover:scale-103 hover:cursor-pointer"
                >
                  <ChevronDown
                    className={cn(
                      'size-6 transition-transform duration-200',
                      isAccountMenuOpen && 'rotate-180'
                    )}
                  />
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8}>
              More
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="wood-panel border-0 p-2 pl-3 min-w-40"
          >
            <LogOutBtn className="w-full" />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
