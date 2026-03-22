'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { MercadoProvider, useMercadoContext } from './mercado-context';
import {
  useGetAvailableRewardsByInterval,
  useGetRewards,
} from '@/hooks/tanstack/queries/rewardQueries';
import { NavLoadingState } from '@/components/employee/nav-loading-state';
import { MercadoStallButton } from './mercado-stall-button';
import { INTERVAL_STALLS } from './mercado-stall-config';
import { buildClosedByInterval, buildIntervalCounts } from './mercado-stall-state';

const HeaderHUD = dynamic(() => import('@/components/employee/widgets/header-hud'), {
  ssr: false,
});

interface MercadoLayoutClientProps {
  children: React.ReactNode;
}

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

  const availableCounts = useMemo(
    () =>
      buildIntervalCounts({
        weekly: weeklyRewards.length,
        monthly: monthlyRewards.length,
        yearly: yearlyRewards.length,
      }),
    [weeklyRewards.length, monthlyRewards.length, yearlyRewards.length]
  );

  const closedByInterval = useMemo(
    () => buildClosedByInterval(allRewards, availableCounts),
    [allRewards, availableCounts]
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
            {INTERVAL_STALLS.map((stall) => (
              <MercadoStallButton
                key={stall.interval}
                stall={stall}
                isClosed={closedByInterval[stall.interval]}
                variant="desktop"
                onSelect={handleStallClick}
              />
            ))}
          </div>

          <div className="flex w-full items-center justify-center gap-2 sm:gap-3 pb-6 md:hidden">
            <CarouselArrowButton direction="left" onClick={handlePreviousMobileStall} />
            <MercadoStallButton
              stall={mobileStall}
              isClosed={closedByInterval[mobileStall.interval]}
              variant="mobile"
              onSelect={handleStallClick}
            />

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
