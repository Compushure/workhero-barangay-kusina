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
  desktop:
    'h-[clamp(16rem,40vw,28rem)] w-[clamp(14rem,35vw,22rem)] md:h-96 md:w-[19rem] lg:h-[28rem] lg:w-[22rem] xl:h-[30rem] xl:w-[24rem]',
  mobile:
    'h-[min(62vw,22rem)] w-[min(62vw,22rem)] sm:h-[min(56vw,23rem)] sm:w-[min(56vw,23rem)] md:h-[24rem] md:w-[20rem]',
} as const;

const CLOSED_BADGE_CLASS = {
  desktop:
    'rounded-md border-2 border-[#47331F] bg-[#B8473E] px-4 sm:px-5 md:px-6 lg:px-6 py-2 text-[clamp(0.8rem,2vw,1.1rem)] font-bold text-[#FFF7E8] shadow-[4px_4px_0px_rgba(71,51,31,0.6)] rotate-[-8deg]',
  mobile:
    'rounded-md border-2 border-[#47331F] bg-[#B8473E] px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 text-[clamp(0.75rem,2vw,0.95rem)] font-bold text-[#FFF7E8] shadow-[4px_4px_0px_rgba(71,51,31,0.6)] rotate-[-8deg]',
} as const;

const LABEL_CLASS = {
  desktop:
    'bg-[#E8DBBF] border-2 border-[#47331F] text-[#47331F] px-4 sm:px-5 md:px-6 lg:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg shadow-[4px_4px_0px_rgba(71,51,31,0.5)] font-bold text-[clamp(0.9rem,1.2vw,1.1rem)] whitespace-nowrap transition-transform group-hover:scale-110',
  mobile:
    'bg-[#E8DBBF] border-2 border-[#47331F] text-[#47331F] px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg shadow-[4px_4px_0px_rgba(71,51,31,0.5)] text-[clamp(0.85rem,2vw,1rem)] font-bold whitespace-nowrap transition-transform group-hover:scale-110',
} as const;

const DESCRIPTION_CLASS = {
  desktop:
    'mt-1 max-w-[10rem] text-center text-[clamp(0.55rem,0.9vw,0.72rem)] leading-tight text-[#47331F]/85 sm:max-w-[11rem] md:max-w-[12rem]',
  mobile:
    'mt-1 max-w-[8rem] text-center text-[clamp(0.5rem,1.6vw,0.65rem)] leading-tight text-[#47331F]/85 sm:max-w-[9rem]',
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
            : '(max-width: 640px) 62vw, (max-width: 768px) 56vw, 320px'
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

      <div className="absolute top-1 left-1/2 -translate-x-1/2">
        <div className={LABEL_CLASS[variant]} style={{ fontFamily: '"Jersey 10", sans-serif' }}>
          <div className="flex flex-col items-center">
            <span>{stall.label}</span>
            <p className={DESCRIPTION_CLASS[variant]}>{stall.description}</p>
          </div>
        </div>
      </div>
    </button>
  );
}
