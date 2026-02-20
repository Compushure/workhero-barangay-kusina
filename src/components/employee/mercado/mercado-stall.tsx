'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MercadoStallProps {
  month: number; // 1-12 for January-December
  imageUrl: string;
  isSelected: boolean;
  isLocked?: boolean;
  onClick: () => void;
  itemCount?: number; // Number of items available in this stall
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
  itemCount = 0,
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
        isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105 hover:z-10',
        isSelected && !isLocked && 'scale-110 z-20'
      )}
    >
      {/* Stall Image */}
      <div
        className={cn(
          'relative w-full aspect-square',
          isLocked && 'blur-sm grayscale',
          isSelected && !isLocked && 'ring-4 ring-[#690003] rounded-lg'
        )}
      >
        <Image src={imageUrl} alt={`${monthName} Stall`} fill className="object-contain" priority />
      </div>

      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2 bg-white/90 px-4 py-3 rounded-lg shadow-lg">
            <Lock className="h-8 w-8 text-gray-600 mx-auto animate-pulse" />
            <p className="text-xs text-gray-700 font-bold">Coming Soon!</p>
          </div>
        </div>
      )}

      {/* Item Count Badge (only if unlocked and has items) */}
      {!isLocked && itemCount > 0 && (
        <div className="absolute -top-2 -right-2 z-30">
          <Badge className="bg-[#690003] text-white px-2 py-1 text-xs font-bold shadow-lg border-2 border-white">
            {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
          </Badge>
        </div>
      )}

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
