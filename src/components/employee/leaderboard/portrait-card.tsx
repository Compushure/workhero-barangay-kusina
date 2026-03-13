'use client';

import { useState } from 'react';
import type { EmployeeTopRankEntry } from '@/types';

export type PortraitCardProps = {
  entry: EmployeeTopRankEntry;
  size: 'large' | 'small';
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

const RANK_BADGE_COLORS: Record<number, string> = {
  1: 'bg-[#F4B925] text-[#47331F]',
  2: 'bg-[#C0C0C0] text-[#47331F]',
  3: 'bg-[#CD7F32] text-white',
};

function RankBadge({ rank }: { rank: number }) {
  const isFirst = rank === 1;
  const colorClass = RANK_BADGE_COLORS[rank] ?? 'bg-[#765332] text-[#F5E8D6]';

  return (
    <div
      className={[
        'absolute left-1/2 z-10 -translate-x-1/2 rounded-full border-2 border-[#47331F] shadow-md',
        'flex select-none font-jersey font-bold',
        isFirst
          ? '-top-5 h-12 w-12 text-2xl sm:-top-6 sm:h-14 sm:w-14 sm:text-3xl'
          : '-top-4 h-10 w-10 text-xl sm:-top-5 sm:h-11 sm:w-11 sm:text-2xl',
        colorClass,
      ].join(' ')}
      aria-hidden
    >
      <span className="flex h-full w-full shrink-0 items-center justify-center leading-none tabular-nums translate-x-px">
        {rank}
      </span>
    </div>
  );
}

export function PortraitCard({ entry, size }: PortraitCardProps) {
  const [imgError, setImgError] = useState(false);
  const isLarge = size === 'large';

  return (
    <div
      className={[
        'relative flex w-full shrink-0 flex-col items-center rounded-lg border-3 border-[#47331F] bg-[#3D2512] shadow-lg transition-transform duration-200 ease-out motion-safe:hover:scale-[1.03]',
        isLarge
          ? 'max-w-66 p-3 pt-6 sm:w-40 sm:min-w-40 sm:max-w-40 sm:p-3 sm:pt-6 md:w-48 md:min-w-48 md:max-w-48 md:p-4 md:pt-7 lg:w-56 lg:min-w-56 lg:max-w-56'
          : 'max-w-none p-3 pt-6',
        entry.isCurrentUser &&
          entry.rank !== 1 &&
          'ring-2 ring-[#47331F] ring-offset-1 ring-offset-transparent',
      ].join(' ')}
    >
      <RankBadge rank={entry.rank} />

      {/* Hanging pin */}
      <div className="absolute -top-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border border-[#47331F] bg-[#47331F]" />

      <div
        className={[
          'flex w-full min-w-0 flex-col items-center gap-3 rounded border border-[#47331F] bg-[#F5E8D6]',
          isLarge ? 'p-3 sm:p-3 md:p-4' : 'p-3',
        ].join(' ')}
      >
        {/* Avatar */}
        <div
          className={[
            'flex shrink-0 overflow-hidden rounded-full border-2 border-[#47331F] bg-[#E89C30]',
            isLarge ? 'h-14 w-14 sm:h-14 sm:w-14 md:h-15 md:w-15' : 'h-12 w-12 sm:h-14 sm:w-14',
          ].join(' ')}
        >
          {entry.profilePictureUrl && !imgError ? (
            <img
              src={entry.profilePictureUrl}
              alt={entry.name}
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span
              className={[
                'flex h-full w-full items-center justify-center font-jersey font-bold text-[#47331F]',
                isLarge ? 'text-2xl sm:text-2xl md:text-3xl' : 'text-lg sm:text-xl',
              ].join(' ')}
            >
              {getInitials(entry.name)}
            </span>
          )}
        </div>

        {/* Name */}
        <span
          className={[
            'w-full min-w-0 truncate text-center font-jersey leading-tight tracking-wide text-[#3D2512]',
            isLarge ? 'text-base sm:text-base md:text-lg' : 'text-sm sm:text-sm md:text-base',
          ].join(' ')}
          title={entry.name}
        >
          {entry.name}
        </span>

        {/* Score */}
        <div className="flex flex-col items-center gap-1">
          <span className="rounded border border-[#47331F] bg-[#F4B925] px-2 py-0.5 text-sm font-jersey text-[#47331F] sm:text-base">
            {entry.performanceScore.toLocaleString()}
          </span>
          <span className="text-[10px] leading-none tracking-widest text-[#3D2512]/80 uppercase font-jersey sm:text-[11px]">
            Performance Score
          </span>
        </div>
      </div>
    </div>
  );
}
