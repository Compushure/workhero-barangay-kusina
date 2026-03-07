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

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center w-14 h-14 rounded-full bg-[#F4B925] border-2 border-[#47331F] shadow-md text-3xl font-bold font-jersey">
        1
      </div>
    );
  }
  const colors: Record<number, string> = {
    2: 'bg-[#C0C0C0] text-[#47331F]',
    3: 'bg-[#CD7F32] text-white',
  };
  const colorClass = colors[rank] ?? 'bg-[#765332] text-[#F5E8D6]';
  return (
    <div
      className={`absolute -top-5 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center w-11 h-11 rounded-full border-2 border-[#47331F] shadow text-2xl font-bold font-jersey ${colorClass}`}
    >
      {rank}
    </div>
  );
}

export function PortraitCard({ entry, size }: PortraitCardProps) {
  const [imgError, setImgError] = useState(false);
  const isLarge = size === 'large';

  const outerClass = [
    'relative flex flex-col items-center rounded-lg border-3 border-[#47331F] shadow-lg',
    'bg-[#3D2512]',
    'transition-transform duration-200 ease-out hover:scale-105',
    'shrink-0',
    isLarge ? 'w-56 min-w-56 max-w-56 p-4 pt-7' : 'w-40 min-w-40 max-w-40 p-3 pt-6',
    entry.isCurrentUser && entry.rank !== 1
      ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-transparent'
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  const parchmentClass = [
    'w-full min-w-0 flex flex-col items-center rounded bg-[#F5E8D6] border border-[#C4A882]',
    isLarge ? 'p-4 gap-3' : 'p-3 gap-3',
  ].join(' ');

  const avatarSize = isLarge ? 'w-15 h-15' : 'w-14 h-14';
  const nameSize = isLarge ? 'text-lg' : 'text-base';
  const scoreSize = isLarge ? 'text-l' : 'text-l';

  const showImage = entry.profilePictureUrl && !imgError;

  return (
    <div className={outerClass}>
      <RankBadge rank={entry.rank} />

      {/* Hanging pin */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#47331F] border border-[#F4B925]" />

      <div className={parchmentClass}>
        {/* Avatar */}
        <div
          className={`${avatarSize} rounded-full bg-[#E89C30] border-2 border-[#47331F] overflow-hidden flex items-center justify-center shrink-0`}
        >
          {showImage ? (
            <img
              src={entry.profilePictureUrl!}
              alt={entry.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span
              className={`font-jersey font-bold text-[#47331F] ${isLarge ? 'text-3xl' : 'text-xl'}`}
            >
              {getInitials(entry.name)}
            </span>
          )}
        </div>

        {/* Name */}
        <span
          className={`font-jersey tracking-wide text-[#3D2512] text-center leading-tight truncate w-full min-w-0 ${nameSize}`}
          title={entry.name}
        >
          {entry.name}
        </span>

        {/* Score */}
        <span
          className={`font-jersey text-[#47331F] bg-[#F4B925] border border-[#47331F] rounded px-2 py-0.5 ${scoreSize}`}
        >
          ★ {entry.performanceScore.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
