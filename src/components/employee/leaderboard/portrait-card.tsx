'use client';

import Image from 'next/image';
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
  3: 'bg-[#CD7F32] text-[#47331F]',
};

function RankBadge({ rank, angleClass }: { rank: number; angleClass: string }) {
  const colorClass = RANK_BADGE_COLORS[rank] ?? 'bg-[#765332] text-[#F5E8D6]';
  const weightClass = rank > 3 ? 'font-normal' : 'font-bold';

  return (
    <div
      className={[
        'absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#4A2E18] shadow-[0_8px_14px_rgba(0,0,0,0.28)]',
        'flex items-center justify-center select-none font-jersey ring-2 ring-[#F8E4B8]/60',
        'h-9 w-9 text-[19px] sm:h-10 sm:w-10 sm:text-[21px]',
        weightClass,
        angleClass,
        colorClass,
      ].join(' ')}
      aria-hidden
    >
      <span className="flex h-full w-full items-center justify-center text-center leading-none tabular-nums text-shadow-[0_1px_0_rgba(255,255,255,0.25)]">
        {rank}
      </span>
    </div>
  );
}

export function PortraitCard({ entry, size }: PortraitCardProps) {
  const [imgError, setImgError] = useState(false);
  const isLarge = size === 'large';
  const cardTiltClass =
    size === 'large'
      ? entry.rank === 1
        ? '-rotate-[1deg]'
        : entry.rank === 2
          ? '-rotate-[1.8deg]'
          : 'rotate-[1.8deg]'
      : entry.rank % 2 === 0
        ? '-rotate-[1.2deg]'
        : 'rotate-[1.2deg]';
  const badgeTiltClass =
    size === 'large'
      ? entry.rank === 1
        ? '-rotate-[1deg]'
        : entry.rank === 2
          ? '-rotate-[1.8deg]'
          : 'rotate-[1.8deg]'
      : entry.rank % 2 === 0
        ? '-rotate-[1.2deg]'
        : 'rotate-[1.2deg]';

  return (
    <div
      className={[
        'relative flex w-full shrink-0 flex-col items-center rounded-none border-[5px] border-[#5A3920] bg-[linear-gradient(180deg,#7D5634_0%,#4D311B_100%)] shadow-[0_18px_32px_rgba(0,0,0,0.34),inset_0_0_0_2px_rgba(255,214,165,0.08)]',
        isLarge
          ? 'max-w-52 p-2 pt-4 sm:w-32 sm:min-w-32 sm:max-w-32 sm:p-2.5 sm:pt-4 md:w-36 md:min-w-36 md:max-w-36 md:p-3 md:pt-4.5 lg:w-40 lg:min-w-40 lg:max-w-40'
          : 'max-w-none min-w-0 p-1 pt-3.5 sm:p-2 sm:pt-3.5',
        cardTiltClass,
        entry.isCurrentUser && 'ring-[5px] ring-[#F4B925] ring-offset-0',
      ].join(' ')}
    >
      <RankBadge rank={entry.rank} angleClass={badgeTiltClass} />

      <div
        className="absolute -top-10 left-1/2 h-8 w-[2px] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(226,208,180,0.92),rgba(125,98,70,0.9))] shadow-[0_0_6px_rgba(0,0,0,0.15)]"
        aria-hidden
      />
      <div
        className="absolute -top-12 left-1/2 z-20 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#F8E8C8_0%,#D7B890_45%,#8C6541_100%)] shadow-[0_0_0_2px_rgba(61,37,18,0.4),0_3px_8px_rgba(0,0,0,0.22)]"
        aria-hidden
      />
      <div
        className="absolute left-1/2 top-2 h-3.5 w-9 -translate-x-1/2 rounded-none bg-[#F1E1BF]/90 shadow-[0_1px_0_rgba(0,0,0,0.12)]"
        aria-hidden
      />

      <div
        className={[
          'flex w-full min-w-0 flex-col items-center justify-between gap-2 text-center rounded-none border-2 border-[#D9C29E] bg-[radial-gradient(circle_at_top,#FBF3DE_0%,#F2E3C3_55%,#E8D3AC_100%)] shadow-[inset_0_0_22px_rgba(255,255,255,0.3)]',
          isLarge
            ? 'min-h-[150px] p-2.5 sm:min-h-[162px] sm:p-2.5 md:min-h-[178px] md:p-3'
            : 'min-h-[116px] p-1.5 sm:min-h-[132px] sm:p-2.5',
        ].join(' ')}
      >
        <div
          className={[
            'flex shrink-0 overflow-hidden rounded-none border-2 border-[#F6E8C8] bg-[#E89C30] shadow-[0_4px_10px_rgba(0,0,0,0.18)]',
            isLarge ? 'h-11 w-11 sm:h-12 sm:w-12 md:h-13 md:w-13' : 'h-8 w-8 sm:h-10 sm:w-10',
          ].join(' ')}
        >
          {entry.profilePictureUrl && !imgError ? (
            <Image
              src={entry.profilePictureUrl}
              alt={entry.name}
              fill
              sizes={isLarge ? '(min-width: 768px) 52px, 48px' : '(min-width: 640px) 40px, 32px'}
              className="object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span
              className={[
                'flex h-full w-full items-center justify-center text-center font-jersey font-bold leading-none text-[#47331F]',
                isLarge ? 'text-xl sm:text-2xl md:text-[26px]' : 'text-xs sm:text-base',
              ].join(' ')}
            >
              {getInitials(entry.name)}
            </span>
          )}
        </div>

        <span
          className={[
            'flex w-full min-w-0 flex-1 items-center justify-center text-center font-jersey leading-tight tracking-[0.04em] text-[#3D2512]',
            isLarge
              ? 'min-h-10 text-[13px] sm:min-h-11 sm:text-sm md:min-h-12 md:text-base'
              : 'line-clamp-2 min-h-7 text-[10px] sm:min-h-8 sm:text-[13px]',
          ].join(' ')}
          title={entry.name}
        >
          {entry.name}
        </span>

        <div className="mt-auto flex w-full justify-center">
          <span className="inline-flex min-w-[3.75rem] max-w-full items-center justify-center rounded-md border border-[#9B6E1A] bg-[linear-gradient(180deg,#F8D04D_0%,#D79A14_100%)] px-1.5 py-0.5 text-center text-[10px] font-jersey leading-none text-[#47331F] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-2px_0_rgba(71,51,31,0.18)] sm:min-w-[4.25rem] sm:px-2 sm:text-xs md:text-sm">
            {entry.performanceScore.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
