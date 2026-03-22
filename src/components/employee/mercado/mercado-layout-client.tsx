'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { MercadoProvider, useMercadoContext } from './mercado-context';
import {
  useGetAvailableRewardsByInterval,
  useGetRewards,
} from '@/hooks/tanstack/queries/rewardQueries';
import { NavLoadingState } from '@/components/employee/nav-loading-state';

const HeaderHUD = dynamic(() => import('@/components/employee/widgets/header-hud'), {
  ssr: false,
});

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
  const { data: allRewards = [] } = useGetRewards();
  const { data: weeklyRewards = [] } = useGetAvailableRewardsByInterval('weekly');
  const { data: monthlyRewards = [] } = useGetAvailableRewardsByInterval('monthly');
  const { data: yearlyRewards = [] } = useGetAvailableRewardsByInterval('yearly');
  const [mobileStallIndex, setMobileStallIndex] = useState(0);

  const rewardsCountByInterval = useMemo(
    () => ({
      weekly: weeklyRewards.length,
      monthly: monthlyRewards.length,
      yearly: yearlyRewards.length,
    }),
    [weeklyRewards.length, monthlyRewards.length, yearlyRewards.length]
  );

  const hiddenOnlyByInterval = useMemo(
    () => ({
      weekly:
        allRewards.some((reward) => reward.availableMonth === 'weekly') &&
        !allRewards.some((reward) => reward.availableMonth === 'weekly' && reward.isActive),
      monthly:
        allRewards.some((reward) => reward.availableMonth === 'monthly') &&
        !allRewards.some((reward) => reward.availableMonth === 'monthly' && reward.isActive),
      yearly:
        allRewards.some((reward) => reward.availableMonth === 'yearly') &&
        !allRewards.some((reward) => reward.availableMonth === 'yearly' && reward.isActive),
    }),
    [allRewards]
  );

  const closedByInterval = useMemo(
    () => ({
      weekly: (rewardsCountByInterval.weekly ?? 0) === 0 || hiddenOnlyByInterval.weekly,
      monthly: (rewardsCountByInterval.monthly ?? 0) === 0 || hiddenOnlyByInterval.monthly,
      yearly: (rewardsCountByInterval.yearly ?? 0) === 0 || hiddenOnlyByInterval.yearly,
    }),
    [rewardsCountByInterval, hiddenOnlyByInterval]
  );

  const handleStallClick = (interval: 'weekly' | 'monthly' | 'yearly') => {
    if (closedByInterval[interval]) {
      return;
    }
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

      <div className="pointer-events-none absolute top-0 left-0 right-0 z-40 w-full px-2 pt-2 sm:px-4">
        <div className="pointer-events-auto">
          <HeaderHUD className="rounded-lg" hideNotificationsOnMercado={false} />
        </div>
      </div>

      <div className="relative z-10 flex h-full w-full items-end justify-center overflow-hidden pb-10 md:pb-12 lg:pb-16">
        <div className="flex h-full w-full max-w-7xl items-end justify-center px-4 translate-y-0 pb-0 md:px-8">
          <div className="hidden items-end justify-center gap-4 md:flex md:gap-6 lg:gap-10">
            {INTERVAL_STALLS.map((stall) => {
              const intervalLabel = stall.label;
              const isDisabled = closedByInterval[stall.interval];

              return (
                <button
                  key={stall.interval}
                  onClick={() => handleStallClick(stall.interval)}
                  disabled={isDisabled}
                  className={cn(
                    'relative shrink-0 transition-all duration-300',
                    'h-80 w-64 md:h-96 md:w-[19rem] lg:h-[28rem] lg:w-[22rem]',
                    isDisabled
                      ? 'cursor-not-allowed'
                      : 'hover:scale-105 active:scale-95 cursor-pointer group'
                  )}
                  aria-label={
                    isDisabled
                      ? `${intervalLabel} market is closed`
                      : `View ${intervalLabel} market`
                  }
                  aria-disabled={isDisabled}
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
                  {isDisabled ? (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div
                        className="rounded-md border-2 border-[#47331F] bg-[#B8473E] px-5 py-2 text-lg font-bold text-[#FFF7E8] shadow-[4px_4px_0px_rgba(71,51,31,0.6)] rotate-[-8deg]"
                        style={{ fontFamily: '"Jersey 10", sans-serif' }}
                      >
                        CLOSED
                      </div>
                    </div>
                  ) : null}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                    <div
                      className="bg-[#E8DBBF] border-2 border-[#47331F] text-[#47331F] px-5 py-2.5 rounded-lg shadow-[4px_4px_0px_rgba(71,51,31,0.5)] font-bold text-base md:text-lg whitespace-nowrap transition-transform group-hover:scale-110"
                      style={{ fontFamily: '"Jersey 10", sans-serif' }}
                    >
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
              disabled={closedByInterval[mobileStall.interval]}
              className={cn(
                'relative shrink-0 transition-all duration-300',
                'h-64 w-64 sm:h-80 sm:w-80',
                closedByInterval[mobileStall.interval]
                  ? 'cursor-not-allowed'
                  : 'hover:scale-105 active:scale-95 cursor-pointer group'
              )}
              aria-label={
                closedByInterval[mobileStall.interval]
                  ? `${mobileStall.label} market is closed`
                  : `View ${mobileStall.label} market`
              }
              aria-disabled={closedByInterval[mobileStall.interval]}
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
              {closedByInterval[mobileStall.interval] ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div
                    className="rounded-md border-2 border-[#47331F] bg-[#B8473E] px-4 py-2 text-base font-bold text-[#FFF7E8] shadow-[4px_4px_0px_rgba(71,51,31,0.6)] rotate-[-8deg]"
                    style={{ fontFamily: '"Jersey 10", sans-serif' }}
                  >
                    CLOSED
                  </div>
                </div>
              ) : null}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                <div
                  className="bg-[#E8DBBF] border-2 border-[#47331F] text-[#47331F] px-5 py-2.5 rounded-lg shadow-[4px_4px_0px_rgba(71,51,31,0.5)] text-base font-bold whitespace-nowrap transition-transform group-hover:scale-110"
                  style={{ fontFamily: '"Jersey 10", sans-serif' }}
                >
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
