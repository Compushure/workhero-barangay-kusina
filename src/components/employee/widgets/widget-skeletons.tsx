"use client";

export function XPProgressSkeleton() {
  return (
    <div className="w-full sm:w-100 max-w-50 sm:max-w-50 wood-panel rounded-lg shadow-md p-2 py-0 flex flex-col items-center">
      <div className="w-full flex items-center gap-2 py-1">
        <div className="h-4 w-4 rounded-full bg-wood-light/70 animate-pulse" />
        <div className="h-5 w-14 rounded bg-wood-light/70 animate-pulse" />
      </div>

      <div className="w-full">
        <div className="h-5 bg-[#273A27] border-2 border-[#47331F] rounded-sm overflow-hidden">
          <div className="h-full w-3/4 bg-wood-light/70 animate-pulse" />
        </div>
      </div>

      <div className="w-full py-1 pl-2">
        <div className="h-5 w-24 rounded bg-wood-light/70 animate-pulse" />
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
    <div className="flex h-14 w-40 max-w-44 items-center justify-start gap-3 rounded-lg wood-panel px-3 shadow-md font-jersey tracking-wider">
      <div className="rounded-full bg-white/20 p-1.5">
        <div className="h-4 w-4 rounded-full bg-wood-light/70 animate-pulse" />
      </div>
      <div className="flex flex-col gap-1 pt-1">
        <div className="h-3 w-20 rounded bg-wood-light/60 animate-pulse" />
        <div className="h-5 w-14 rounded bg-wood-light/70 animate-pulse" />
      </div>
    </div>
  );
}