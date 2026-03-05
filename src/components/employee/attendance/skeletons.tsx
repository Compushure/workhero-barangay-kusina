'use client';

import { Trophy } from 'lucide-react';

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

export function RankWidgetSkeleton({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const cardClassName =
    'bg-[#765332] rounded-lg shadow-md border-3 border-[#47331F] p-4 mb-4 w-[280px] min-h-[140px] shrink-0 font-jersey tracking-widest';

  if (isCollapsed) {
    return (
      <div className="bg-[#765332] border-3 border-[#47331F] rounded-full h-16 w-16 mx-auto flex items-center justify-center mb-4">
        <div className="animate-pulse">
          <Trophy size={20} className="text-yellow-500 opacity-50" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${cardClassName} animate-pulse`}>
      {/* Header Skeleton */}
      <div className="w-28 h-5 bg-white/20 rounded mx-auto mb-2" />

      {/* Horizontal Divider */}
      <div className="border-t-2 border-white/30 mb-3" />

      {/* Content Section */}
      <div className="flex items-center justify-between">
        {/* Left: Trophy + Rank */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-white/20 rounded-full" />
          <div className="h-7 w-12 bg-white/20 rounded" />
        </div>

        {/* Vertical Divider */}
        <div className="h-12 border-l-2 border-white/30 mx-4" />

        {/* Right: Performance Score */}
        <div className="flex flex-col items-end gap-1">
          <div className="w-20 h-3 bg-white/20 rounded" />
          <div className="w-14 h-6 bg-white/20 rounded" />
        </div>
      </div>
    </div>
  );
}