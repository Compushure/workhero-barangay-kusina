'use client';

import { Trophy } from 'lucide-react';
import XPProgress from './xp-level-widget';
import PointsCardWidget from './points-card-widget';
import { cn } from '@/lib/utils';
import { LogOutBtn } from './logout';
import { MapLauncher } from '../minimap/map-launcher';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { RankWidget } from '../dashboard/rank-panel';
import { NotificationsPopover } from '@/components/notifications/notifications';
import { DialogTitle } from '@radix-ui/react-dialog';

interface HeaderHUDProps {
  className?: string;
}

export default function HeaderHUD({ className }: HeaderHUDProps) {
  return (
    <div
      data-dashboard-hud="true"
      className={cn(
        'sticky flex min-h-15 w-full items-center justify-start gap-2 overflow-x-hidden px-0.5 sm:gap-2.5 sm:pl-2 lg:pr-20',
        className
      )}
    >
      <div className="flex w-full min-w-0 items-center gap-2 sm:gap-2.5 lg:w-auto lg:flex-none lg:gap-3">
        <div className="min-w-0 shrink-0 font-jersey lg:min-w-fit lg:flex-none">
          <XPProgress />
        </div>

        <div className="min-w-0 shrink-0 font-jersey lg:min-w-fit lg:flex-none">
          <PointsCardWidget />
        </div>
      </div>

      <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="flex items-center gap-5 rounded-lg border-2 border-[#47331F]/50 bg-[#eadbc1]/75 shadow-md/25 px-3 py-1.5 backdrop-blur-[1px]">
          <div className="shrink-0">
            <Dialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex">
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        aria-label="View weekly rank"
                        className="inline-flex size-10 items-center justify-center rounded-full wood-panel text-card shadow-md transition-colors hover:text-accent-secondary"
                      >
                        <Trophy className="size-5 text-yellow-500" />
                      </button>
                    </DialogTrigger>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8}>
                  Weekly Rank
                </TooltipContent>
              </Tooltip>

              <DialogContent className="w-[92vw] max-w-sm border-none bg-transparent p-0 shadow-none [&>button]:text-white">
                <DialogTitle className="hidden">Rank Widget</DialogTitle>
                <RankWidget className="mb-0! ml-0! w-full!" />
              </DialogContent>
            </Dialog>
          </div>

          <div className="shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex">
                  <NotificationsPopover
                    triggerClassName="size-10"
                    popoverSide="top"
                    popoverAlign="center"
                    popoverCollisionPadding={{ top: 8, right: 12, bottom: 12, left: 12 }}
                    popoverSideOffset={12}
                    popoverContentClassName="w-[min(22.5rem,calc(100vw-1.5rem))]"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8}>
                Notifications
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex">
                  <MapLauncher inline className="size-10" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8}>
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
                    className="size-10 wood-panel text-card hover:text-accent-secondary"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8}>
                Logout
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="hidden items-center gap-3 lg:ml-auto lg:flex">
        <div className="shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex">
                <NotificationsPopover
                  triggerClassName="size-12"
                  popoverSide="bottom"
                  popoverAlign="end"
                  popoverCollisionPadding={8}
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
                <MapLauncher inline className="size-12" />
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
                  className="size-12 wood-panel text-card hover:text-accent-secondary"
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
