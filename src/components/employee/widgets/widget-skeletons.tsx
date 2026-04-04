'use client';

export function XPProgressSkeleton() {
  return (
    <div className="flex h-14 w-full items-center gap-1.5 rounded-lg wood-panel px-1.5 py-1 shadow-md sm:h-15 sm:gap-2 sm:px-2 sm:py-1.5 md:h-16 md:w-[clamp(15rem,30vw,21rem)] md:px-2.5">
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full wood-panel shadow-[2px_2px_2px_#000] shadow-[#47331F]/50 sm:h-9 sm:w-9 md:h-10 md:w-10">
        <div className="h-full w-full rounded-full bg-wood-light/70 animate-pulse" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex w-full items-center justify-between gap-2 py-0.5">
          <div className="h-3 w-14 rounded bg-wood-light/70 animate-pulse sm:h-3.5 sm:w-16 md:h-4 md:w-18" />
          <div className="h-3 w-18 rounded bg-wood-light/70 animate-pulse sm:h-3.5 sm:w-22 md:h-4 md:w-24" />
        </div>

        <div className="w-full pt-0.5">
          <div className="h-2 overflow-hidden rounded-sm border-2 border-[#47331F] bg-[#273A27] sm:h-2.5 md:h-3">
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
    <div className="flex h-14 w-full items-center justify-start gap-1.5 rounded-lg wood-panel px-2 shadow-md font-jersey tracking-wider sm:h-15 sm:gap-2 sm:px-2.5 md:h-16 md:w-[clamp(9.5rem,18vw,12.5rem)]">
      <div className="rounded-full bg-white/20 p-1 sm:p-1.5">
        <div className="h-3.5 w-3.5 rounded-full bg-wood-light/70 animate-pulse sm:h-4 sm:w-4" />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="hidden h-3 w-20 rounded bg-wood-light/60 animate-pulse md:block" />
        <div className="h-5 w-14 rounded bg-wood-light/70 animate-pulse sm:h-6 sm:w-16 md:h-7 md:w-18" />
      </div>
    </div>
  );
}
