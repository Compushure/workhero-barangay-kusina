'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function HeaderHUDSkeleton() {
  return (
    <div className="sticky flex min-h-15 w-full items-center justify-start gap-2 overflow-x-hidden px-0.5 sm:gap-2.5 sm:pl-2 lg:pr-20">
      <div className="flex w-full min-w-0 items-center gap-2 sm:gap-2.5 lg:w-auto lg:flex-none lg:gap-3">
        <div className="min-w-0 shrink-0 font-jersey lg:min-w-fit lg:flex-none">
          <XPProgressSkeleton />
        </div>

        <div className="min-w-0 shrink-0 font-jersey lg:min-w-fit lg:flex-none">
          <PointsCardWidgetSkeleton />
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="flex items-center gap-5 rounded-lg bg-black/25 px-3 py-1.5 shadow-md/25 backdrop-blur-[1px]">
          <Skeleton className="size-10 rounded-full bg-[#8a6039]/70" />
          <Skeleton className="size-10 rounded-full bg-[#8a6039]/70" />
          <Skeleton className="size-10 rounded-full bg-[#8a6039]/70" />
          <Skeleton className="size-10 rounded-full bg-[#8a6039]/70" />
        </div>
      </div>

      <div className="ml-auto hidden shrink-0 items-center gap-3 lg:flex">
        <Skeleton className="size-12 rounded-full bg-[#8a6039]/70" />
        <Skeleton className="size-12 rounded-full bg-[#8a6039]/70" />
        <Skeleton className="size-12 rounded-full bg-[#8a6039]/70" />
      </div>
    </div>
  );
}

export function XPProgressSkeleton() {
  return (
    <div className="flex h-12 items-center gap-1.5 rounded-lg wood-panel px-1.5 py-1 shadow-md sm:h-13 sm:gap-2 sm:px-2 sm:py-1.5 md:h-14 w-[clamp(12rem,25vw,18rem)] md:w-[clamp(15rem,30vw,21rem)] md:px-2.5">
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full wood-panel shadow-[2px_2px_2px_#000] shadow-[#47331F]/50 sm:h-11 sm:w-11 md:h-12 md:w-12">
        <div className="h-full w-full rounded-full bg-wood-light/70 animate-pulse" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex w-full items-center justify-between gap-1 py-0.5">
          <div className="h-3 w-13 rounded bg-wood-light/70 animate-pulse sm:h-3.5 sm:w-16 md:h-4 md:w-18" />
          <div className="h-3 w-17 rounded bg-wood-light/70 animate-pulse sm:h-3.5 sm:w-22 md:h-4 md:w-24" />
        </div>

        <div className="w-full pt-0.5">
          <div className="h-2.5 md:h-4 overflow-hidden rounded-sm border-2 border-[#47331F] bg-[#273A27]">
            <div className="h-full w-3/4 bg-wood-light/70 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileLevelSkeleton() {
  return (
    <div className="inline-flex w-auto max-w-full items-center wood-panel rounded-lg shadow-md p-2">
      <div className="w-12 h-12 rounded-full flex items-center justify-center wood-panel shrink-0 mr-3 overflow-hidden shadow-[2px_2px_2px_#000] shadow-[#47331F]/50">
        <div className="w-full h-full animate-pulse bg-wood-light/70 rounded-full" />
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <div className="h-5 w-28 rounded bg-wood-light/70 animate-pulse" />
        <div className="h-4 w-36 rounded bg-wood-light/60 animate-pulse" />
      </div>
    </div>
  );
}

export function PointsCardWidgetSkeleton() {
  return (
    <div className="flex h-12 items-center justify-start gap-1.5 rounded-lg wood-panel px-2 shadow-md font-jersey tracking-wider sm:h-13 sm:gap-2 sm:px-2.5 w-[clamp(6rem,12vw,8rem)] md:h-14 md:w-[clamp(10rem,16vw,12rem)]">
      <div className="rounded-full bg-white/20 p-1 sm:p-1.5">
        <div className="h-4 w-4 rounded-full bg-wood-light/70 animate-pulse md:h-5 md:w-5" />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="hidden h-3 w-20 rounded bg-wood-light/60 animate-pulse md:block" />
        <div className="h-7 w-10 rounded bg-wood-light/70 animate-pulse lg:w-18" />
      </div>
    </div>
  );
}
