'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { MercadoInterval } from './mercado-context';
import type { IntervalStall } from './mercado-stall-config';
import { STALL_HOVER_GLOW_CLASS } from './mercado-stall-config';

interface MercadoStallButtonProps {
  stall: IntervalStall;
  isClosed: boolean;
  variant: 'desktop' | 'mobile';
  onSelect: (interval: MercadoInterval) => void;
}

const STALL_VARIANT_CLASS = {
  desktop: 'h-80 w-64 md:h-96 md:w-[19rem] lg:h-[28rem] lg:w-[22rem]',
  mobile: 'h-64 w-64 sm:h-80 sm:w-80',
} as const;

const CLOSED_BADGE_CLASS = {
  desktop:
    'rounded-md border-2 border-[#47331F] bg-[#B8473E] px-5 py-2 text-lg font-bold text-[#FFF7E8] shadow-[4px_4px_0px_rgba(71,51,31,0.6)] rotate-[-8deg]',
  mobile:
    'rounded-md border-2 border-[#47331F] bg-[#B8473E] px-4 py-2 text-base font-bold text-[#FFF7E8] shadow-[4px_4px_0px_rgba(71,51,31,0.6)] rotate-[-8deg]',
} as const;

const LABEL_CLASS = {
  desktop:
    'bg-[#E8DBBF] border-2 border-[#47331F] text-[#47331F] px-5 py-2.5 rounded-lg shadow-[4px_4px_0px_rgba(71,51,31,0.5)] font-bold text-base md:text-lg whitespace-nowrap transition-transform group-hover:scale-110',
  mobile:
    'bg-[#E8DBBF] border-2 border-[#47331F] text-[#47331F] px-5 py-2.5 rounded-lg shadow-[4px_4px_0px_rgba(71,51,31,0.5)] text-base font-bold whitespace-nowrap transition-transform group-hover:scale-110',
} as const;

export function MercadoStallButton({
  stall,
  isClosed,
  variant,
  onSelect,
}: MercadoStallButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(stall.interval)}
      disabled={isClosed}
      className={cn(
        'relative shrink-0 transition-all duration-300',
        STALL_VARIANT_CLASS[variant],
        isClosed ? 'cursor-not-allowed' : 'hover:scale-105 active:scale-95 cursor-pointer group'
      )}
      aria-label={isClosed ? `${stall.label} market is closed` : `View ${stall.label} market`}
      aria-disabled={isClosed}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className={STALL_HOVER_GLOW_CLASS} />
      </div>

      <Image
        src={stall.image}
        alt={`${stall.label} market stall`}
        fill
        className="object-contain pixelated"
        sizes={
          variant === 'desktop'
            ? '(max-width: 768px) 256px, (max-width: 1024px) 304px, 352px'
            : '(max-width: 768px) 256px, 320px'
        }
      />

      {isClosed ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className={CLOSED_BADGE_CLASS[variant]}
            style={{ fontFamily: '"Jersey 10", sans-serif' }}
          >
            CLOSED
          </div>
        </div>
      ) : null}

      <div className="absolute -top-1 left-1/2 -translate-x-1/2">
        <div className={LABEL_CLASS[variant]} style={{ fontFamily: '"Jersey 10", sans-serif' }}>
          {stall.label}
        </div>
      </div>
    </button>
  );
}
