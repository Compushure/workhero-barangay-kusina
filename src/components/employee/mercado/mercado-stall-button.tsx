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
    'h-[clamp(255px,38vw,430px)] w-[clamp(235px,34vw,380px)] md:h-auto md:w-auto lg:h-[22.5rem] lg:w-[18.5rem] xl:h-[28rem] xl:w-[23.5rem]',
  mobile:
    'h-[clamp(300px,82vw,430px)] w-[clamp(280px,76vw,380px)] max-w-[calc(100vw-2.25rem)] max-[380px]:h-[min(82vw,340px)] max-[380px]:w-[min(82vw,340px)] max-[380px]:max-w-[calc(100vw-2.75rem)] sm:h-[clamp(320px,74vw,430px)] sm:w-[clamp(300px,68vw,380px)] sm:max-w-[calc(100vw-3rem)] md:h-[clamp(320px,62vw,430px)] md:w-[clamp(300px,56vw,380px)] md:max-w-[calc(100vw-3.5rem)]',
} as const;

const CLOSED_BADGE_CLASS = {
  desktop:
    'rounded-md border-2 border-[#47331F] bg-[#B8473E] px-4 sm:px-5 md:px-6 lg:px-6 py-2 text-[clamp(0.8rem,2vw,1.1rem)] font-bold text-[#FFF7E8] shadow-[4px_4px_0px_rgba(71,51,31,0.6)] rotate-[-8deg]',
  mobile:
    'rounded-md border-2 border-[#47331F] bg-[#B8473E] px-4 sm:px-4.5 md:px-5 py-2 text-[clamp(0.82rem,2vw,1.05rem)] font-bold text-[#FFF7E8] shadow-[4px_4px_0px_rgba(71,51,31,0.6)] rotate-[-8deg]',
} as const;

const LABEL_CLASS = {
  desktop:
    'bg-[#E8DBBF] border-2 border-[#47331F] text-[#47331F] px-4 sm:px-5 md:px-6 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-3 rounded-lg shadow-[4px_4px_0px_rgba(71,51,31,0.5)] font-bold text-[clamp(0.95rem,1.2vw,1.2rem)] whitespace-nowrap transition-transform group-hover:scale-110',
  mobile:
    'bg-[#E8DBBF] border-2 border-[#47331F] text-[#47331F] px-4 sm:px-4.5 md:px-5 py-2 sm:py-2.25 md:py-2.5 rounded-lg shadow-[4px_4px_0px_rgba(71,51,31,0.5)] text-[clamp(0.95rem,1.9vw,1.15rem)] font-bold whitespace-nowrap transition-transform group-hover:scale-110',
} as const;

const DESCRIPTION_CLASS = {
  desktop:
    'mt-1 max-w-[11rem] text-center text-[clamp(0.66rem,0.85vw,0.8rem)] leading-tight text-[#47331F]/85 sm:max-w-[12rem] md:max-w-[13rem]',
  mobile:
    'mt-1 max-w-[11rem] text-center text-[clamp(0.66rem,1.05vw,0.8rem)] leading-tight text-[#47331F]/85 font-medium sm:max-w-[12rem] md:max-w-[13rem]',
} as const;

const LABEL_WRAPPER_CLASS = {
  desktop: 'absolute top-[11%] left-1/2 z-20 -translate-x-1/2',
  mobile: 'absolute top-[-3%] left-1/2 z-20 -translate-x-1/2 md:top-[6%]',
} as const;

const STALL_POSITION_CLASS = {
  desktop: 'lg:-translate-y-10 xl:-translate-y-11',
  mobile: '',
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
        'relative shrink-0 transition-all duration-300 drop-shadow-[0_14px_22px_rgba(20,12,6,0.55)]',
        STALL_VARIANT_CLASS[variant],
        STALL_POSITION_CLASS[variant],
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
        unoptimized
        className={cn(
          'object-contain object-bottom pixelated contrast-110 saturate-110 brightness-105',
          stall.imageAdjustClassName
        )}
        sizes={
          variant === 'desktop'
            ? '(max-width: 768px) 320px, (max-width: 1024px) 380px, 460px'
            : '(max-width: 640px) 82vw, (max-width: 1024px) 62vw, 430px'
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

      <div className={LABEL_WRAPPER_CLASS[variant]}>
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
