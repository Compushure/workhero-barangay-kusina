'use client';

import { Trophy } from 'lucide-react';

export function AttendanceCardSkeleton() {
  return (
    <div className="relative flex bg-[#E8DBBF] border-3 border-[#47331F] flex-col items-center parchment-card rounded-xl p-6 max-w-md w-full shadow-[6px_6px_0px_#000] shadow-[#47331F]/50 animate-pulse">
      <div className="w-40 h-6 bg-[#d9b77a] rounded mb-3" />
      <div className="w-56 h-4 bg-[#d9b77a] rounded mb-4" />

      <div className="w-full h-32 bg-[#d9b77a] rounded" />
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
