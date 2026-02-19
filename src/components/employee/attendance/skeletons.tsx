'use client';

export function XPProgressSkeleton() {
  return (
    <div className="w-60 max-w-5xl bg-[#765332] rounded-lg shadow-md border-3 border-[#47331F] p-2 py-0 flex flex-col items-center">
      {/* XP text skeleton */}
      <div className="w-full flex justify-start m-2">
        <div className="w-32 h-6 bg-[#d9b77a] animate-pulse rounded" />
      </div>

      {/* Progress bar skeleton */}
      <div className="w-full">
        <div className="h-5 bg-[#273A27] border-2 border-[#47331F] rounded-sm overflow-hidden">
          <div className="h-full w-full bg-[#d9b77a] animate-pulse" />
        </div>
      </div>

      {/* Points row skeleton */}
      <div className="w-full flex items-center gap-2 m-2">
        <div className="w-5 h-5 bg-[#d9b77a] animate-pulse rounded-full" />
        <div className="w-20 h-5 bg-[#d9b77a] animate-pulse rounded" />
      </div>
    </div>
  );
}

export function ProfileLevelSkeleton() {
  return (
    <div className="inline-flex items-center bg-[#765332] border-3 border-[#47331F] rounded-lg shadow-md p-2">
      {/* Avatar circle skeleton */}
      <div className="w-12 h-12 rounded-full bg-[#E89C30] flex items-center justify-center border-2 border-[#47331F] shrink-0 mr-3 overflow-hidden">
        <div className="w-full h-full animate-pulse bg-[#d9b77a] rounded-full" />
      </div>

      {/* Name + level skeleton */}
      <div className="flex flex-col">
        <div className="w-24 h-4 bg-[#d9b77a] animate-pulse rounded mb-1" />
        <div className="w-16 h-3 bg-[#d9b77a] animate-pulse rounded" />
      </div>
    </div>
  );
}

export function RankWidgetSkeleton() {
  return (
    <div className="bg-[#765332] border-3 border-[#47331F] rounded-lg p-4 mb-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-2">
        <div className="w-5 h-5 bg-[#d9b77a] animate-pulse rounded" />
        <div className="w-16 h-5 bg-[#d9b77a] animate-pulse rounded" />
        <div className="w-5 h-5 bg-[#d9b77a] animate-pulse rounded" />
      </div>

      {/* Trophy + rank skeleton */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-[#d9b77a] animate-pulse rounded-full" />
        <div className="flex flex-col gap-1">
          <div className="w-20 h-5 bg-[#d9b77a] animate-pulse rounded" />
        </div>
      </div>

      {/* XP line skeleton */}
      <div className="w-32 h-4 bg-[#d9b77a] animate-pulse rounded" />
    </div>
  );
}

