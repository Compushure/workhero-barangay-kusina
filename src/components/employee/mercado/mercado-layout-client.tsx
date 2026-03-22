'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MercadoProvider, useMercadoContext } from './mercado-context';
import { useMercadoPageData } from '@/hooks/useMercadoPageData';
import { NavLoadingState } from '@/components/employee/nav-loading-state';
import { LogOutBtn } from '@/components/employee/widgets/logout';
import { NotificationsPopover } from '@/components/notifications/notifications';
import { MapLauncher } from '@/components/employee/minimap/map-launcher';

interface MercadoLayoutClientProps {
  children: React.ReactNode;
}

interface IntervalStall {
  interval: 'weekly' | 'monthly' | 'yearly';
  label: string;
  image: string;
}

const INTERVAL_STALLS: IntervalStall[] = [
  { interval: 'weekly', label: 'Weekly', image: '/mercado/stall-weekly.png' },
  { interval: 'monthly', label: 'Monthly', image: '/mercado/stall-monthly.png' },
  { interval: 'yearly', label: 'Yearly', image: '/mercado/stall-yearly.png' },
];

const STALL_HOVER_GLOW_CLASS =
  'h-44 w-44 sm:h-56 sm:w-56 md:h-64 md:w-64 rounded-full bg-[#F4B925]/45 blur-3xl opacity-0 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-110 group-active:opacity-100';

interface CarouselArrowButtonProps {
  direction: 'left' | 'right';
  onClick: () => void;
}

function CarouselArrowButton({ direction, onClick }: CarouselArrowButtonProps) {
  const imageSrc = direction === 'left' ? '/mercado/left-arrow.png' : '/mercado/right-arrow.png';
  const altText = direction === 'left' ? 'Previous stall' : 'Next stall';

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#47331F] bg-[#765332]/90 p-2 transition-all hover:scale-105 active:scale-95"
      aria-label={altText}
    >
      <Image src={imageSrc} alt={altText} width={36} height={36} className="object-contain" />
    </button>
  );
}

function MercadoLayoutContent({ children }: MercadoLayoutClientProps) {
  const { setSelectedInterval } = useMercadoContext();
  const { userPoints, isLoading } = useMercadoPageData();
  const [mobileStallIndex, setMobileStallIndex] = useState(0);

  const marketControlStyles = {
    shell: 'bg-[#765332] border-3 border-[#47331F] rounded-lg',
    label: 'text-xs sm:text-sm text-[#F5E8D6]/90 font-medium whitespace-nowrap',
    value: 'text-xl sm:text-2xl font-bold text-[#F5E8D6] pixelated-text leading-tight',
    iconWrap:
      'flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#E89C30] border-2 border-[#47331F] shrink-0',
    bellTrigger:
      'h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-[#765332] border-3 border-[#47331F] text-[#F5E8D6] hover:scale-105 hover:bg-[#765332] hover:text-[#F5E8D6] transition-all shadow-none',
    bellIcon: 'h-6 w-6 sm:h-8 sm:w-8',
    bellBadge:
      'bg-[#E89C30] text-[#690003] border border-[#47331F] font-bold text-[10px] sm:text-xs',
  };

  const handleStallClick = (interval: 'weekly' | 'monthly' | 'yearly') => {
    setSelectedInterval(interval);
  };

  const handlePreviousMobileStall = () => {
    setMobileStallIndex((prev) => (prev === 0 ? INTERVAL_STALLS.length - 1 : prev - 1));
  };

  const handleNextMobileStall = () => {
    setMobileStallIndex((prev) => (prev === INTERVAL_STALLS.length - 1 ? 0 : prev + 1));
  };

  const mobileStall = INTERVAL_STALLS[mobileStallIndex];

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <NavLoadingState />
      <Image
        src="/mercado/mercado-bg.png"
        alt="Mercado Background"
        fill
        className="object-cover object-bottom"
        priority
        quality={100}
      />

      <div className="absolute top-4 left-4 z-40 flex items-start gap-2 sm:gap-3 md:top-6 md:left-6">
        <div
          className={cn(
            'w-auto min-w-[130px] px-3 sm:px-4 py-2 sm:py-3 md:w-50',
            marketControlStyles.shell
          )}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={marketControlStyles.iconWrap}>
              <Coins className="h-6 w-6 sm:h-7 sm:w-7 text-[#690003]" />
            </div>
            <div>
              <p className={marketControlStyles.label}>Fiesta Points</p>
              <p className={marketControlStyles.value}>
                {isLoading ? '...' : userPoints.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-0.5">
          <NotificationsPopover
            triggerClassName={marketControlStyles.bellTrigger}
            iconClassName={marketControlStyles.bellIcon}
            badgeClassName={marketControlStyles.bellBadge}
          />
        </div>
      </div>

      <div className="absolute top-4 right-4 z-40 flex flex-col items-end gap-3 md:top-6 md:right-6">
        <LogOutBtn />
      </div>

      <MapLauncher className="right-4 top-27 translate-y-0 md:right-6 md:top-31" />

      <div className="relative z-10 flex h-full w-full items-end justify-center overflow-hidden pb-10 md:pb-12 lg:pb-16">
        <div className="flex h-full w-full max-w-7xl items-end justify-center px-4 translate-y-0 pb-0 md:px-8">
          <div className="hidden items-end justify-center gap-4 md:flex md:gap-6 lg:gap-10">
            {INTERVAL_STALLS.map((stall) => {
              const intervalLabel = stall.label;

              return (
                <button
                  key={stall.interval}
                  onClick={() => handleStallClick(stall.interval)}
                  className={cn(
                    'relative shrink-0 transition-all duration-300',
                    'h-80 w-64 md:h-96 md:w-[19rem] lg:h-[28rem] lg:w-[22rem]',
                    'hover:scale-105 active:scale-95 cursor-pointer group'
                  )}
                  aria-label={`View ${intervalLabel} market`}
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  >
                    <div className={STALL_HOVER_GLOW_CLASS} />
                  </div>

                  <Image
                    src={stall.image}
                    alt={`${intervalLabel} market stall`}
                    fill
                    className="object-contain pixelated"
                    sizes="(max-width: 768px) 256px, (max-width: 1024px) 304px, 352px"
                  />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <div className="bg-[#E8DBBF] border-2 border-[#47331F] text-[#47331F] px-5 py-2.5 rounded-lg shadow-[4px_4px_0px_rgba(71,51,31,0.5)] font-bold text-base md:text-lg pixelated-text whitespace-nowrap transition-transform group-hover:scale-110">
                      {intervalLabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex w-full items-center justify-center gap-2 sm:gap-3 pb-6 md:hidden">
            <CarouselArrowButton direction="left" onClick={handlePreviousMobileStall} />

            <button
              type="button"
              onClick={() => handleStallClick(mobileStall.interval)}
              className={cn(
                'relative shrink-0 transition-all duration-300',
                'h-64 w-64 sm:h-80 sm:w-80',
                'hover:scale-105 active:scale-95 cursor-pointer group'
              )}
              aria-label={`View ${mobileStall.label} market`}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                <div className={STALL_HOVER_GLOW_CLASS} />
              </div>

              <Image
                src={mobileStall.image}
                alt={`${mobileStall.label} market stall`}
                fill
                className="object-contain pixelated"
                sizes="(max-width: 768px) 256px, 320px"
              />
              <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                <div className="bg-[#E8DBBF] border-2 border-[#47331F] text-[#47331F] px-5 py-2.5 rounded-lg shadow-[4px_4px_0px_rgba(71,51,31,0.5)] text-base font-bold pixelated-text whitespace-nowrap transition-transform group-hover:scale-110">
                  {mobileStall.label}
                </div>
              </div>
            </button>

            <CarouselArrowButton direction="right" onClick={handleNextMobileStall} />
          </div>
        </div>
      </div>

      <div className="relative z-50">{children}</div>
    </div>
  );
}

export function MercadoLayoutClient({ children }: MercadoLayoutClientProps) {
  return (
    <MercadoProvider>
      <MercadoLayoutContent>{children}</MercadoLayoutContent>
    </MercadoProvider>
  );
}
