'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Lock } from 'lucide-react';

interface MercadoStallProps {
  month: number; // 1-12 for January-December
  imageUrl: string;
  isSelected: boolean;
  isLocked?: boolean;
  onClick: () => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function MercadoStall({
  month,
  imageUrl,
  isSelected,
  isLocked = false,
  onClick,
}: MercadoStallProps) {
  const monthName = MONTH_NAMES[month - 1];

  const handleClick = () => {
    if (!isLocked) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLocked}
      className={cn(
        'relative group transition-all duration-300 ease-in-out',
        isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-105 hover:z-10',
        isSelected && !isLocked && 'scale-110 z-20'
      )}
    >
      {/* Stall Image */}
      <div className="relative w-full aspect-square">
        <Image src={imageUrl} alt={`${monthName} Stall`} fill className="object-contain" priority />

        {/* Locked Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center rounded-lg backdrop-blur-sm">
            <div className="text-center space-y-2">
              <Lock className="h-8 w-8 text-white mx-auto animate-pulse" />
              <p className="text-xs text-white font-bold">Coming Soon!</p>
            </div>
          </div>
        )}

        {/* Hover/Selected Overlay (only if not locked) */}
        {!isLocked && (
          <div
            className={cn(
              'absolute inset-0 bg-[#690003]/0 transition-all duration-300',
              'group-hover:bg-[#690003]/10',
              isSelected && 'bg-[#690003]/20 ring-4 ring-[#690003] rounded-lg'
            )}
          />
        )}
      </div>

      {/* Month Label */}
      <div
        className={cn(
          'absolute -bottom-8 left-1/2 -translate-x-1/2',
          'px-3 py-1 rounded-full',
          'whitespace-nowrap text-sm font-bold',
          'transition-all duration-300',
          'bg-white border-2 shadow-md',
          isLocked
            ? 'border-gray-400 text-gray-500'
            : isSelected
              ? 'border-[#690003] text-[#690003] scale-110'
              : 'border-gray-300 text-gray-700 group-hover:border-[#690003] group-hover:text-[#690003]'
        )}
      >
        {isLocked && <Lock className="inline h-3 w-3 mr-1" />}
        {monthName}
      </div>
    </button>
  );
}
