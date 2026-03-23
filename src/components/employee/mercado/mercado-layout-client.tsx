'use client';

import { useMemo, useState, useEffect } from 'react';
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

function useIsTabletOrLarger() {
  const [isTabletOrLarger, setIsTabletOrLarger] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const updateMatch = (event: MediaQueryListEvent) => {
      setIsTabletOrLarger(event.matches);
    };

    setIsTabletOrLarger(mediaQuery.matches);
    mediaQuery.addEventListener('change', updateMatch);

    return () => {
      mediaQuery.removeEventListener('change', updateMatch);
    };
  }, []);

  return isTabletOrLarger;
}

function CarouselArrowButton({ direction, onClick }: CarouselArrowButtonProps) {
  const arrow = direction === 'left' ? '←' : '→';
  const altText = direction === 'left' ? 'Previous stall' : 'Next stall';

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#47331F] bg-[#765332]/90 transition-all hover:scale-110 active:scale-95 text-xl font-bold text-[#F5E6D3] sm:h-14 sm:w-14 sm:text-2xl md:h-13 md:w-13 lg:h-16 lg:w-16"
      aria-label={altText}
    >
      {arrow}
    </button>
  );
}

function MercadoLayoutContent({ children }: MercadoLayoutClientProps) {
  const { setSelectedInterval } = useMercadoContext();
  const { data: allRewards = [] } = useGetRewards();
  const { data: weeklyRewards = [] } = useGetAvailableRewardsByInterval('weekly');
  const { data: monthlyRewards = [] } = useGetAvailableRewardsByInterval('monthly');
  const { data: yearlyRewards = [] } = useGetAvailableRewardsByInterval('yearly');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const isTabletOrLarger = useIsTabletOrLarger();

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

  const handlePreviousStall = () => {
    setCarouselIndex((prev) => (prev === 0 ? INTERVAL_STALLS.length - 1 : prev - 1));
  };

  const handleNextStall = () => {
    setCarouselIndex((prev) => (prev === INTERVAL_STALLS.length - 1 ? 0 : prev + 1));
  };

  // Get stalls to show in carousel (1 for sm, 2 for md, 3 for lg+)
  const getVisibleStalls = () => {
    const stalls = [];
    for (let i = 0; i < 3; i++) {
      stalls.push(INTERVAL_STALLS[(carouselIndex + i) % INTERVAL_STALLS.length]);
    }
    return stalls;
  };

  const visibleStalls = getVisibleStalls();

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
        <div className="pointer-events-auto flex w-full flex-col gap-2">
          <HeaderHUD className="rounded-lg" hideNotificationsOnMercado={false} />
        </div>
      </div>

      <div className="relative z-10 flex h-full w-full items-end justify-center overflow-hidden pb-4 sm:pb-6 md:pb-8 lg:pb-10">
        <div className="flex h-full w-full max-w-6xl items-end justify-center px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Desktop: 3 stalls grid (lg+) */}
          <div className="hidden items-end justify-center gap-4 sm:gap-6 md:gap-8 lg:flex lg:gap-10 xl:gap-12">
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

          {/* Mobile: 1 stall carousel (sm/md only) */}
          <div className="flex w-full items-center justify-center gap-2 sm:gap-3 md:gap-4 pb-2 sm:pb-3 md:pb-4 lg:hidden">
            <CarouselArrowButton direction="left" onClick={handlePreviousStall} />
            <MercadoStallButton
              stall={visibleStalls[0]}
              isClosed={closedByInterval[visibleStalls[0].interval]}
              variant={isTabletOrLarger ? 'desktop' : 'mobile'}
              onSelect={handleStallClick}
            />
            <CarouselArrowButton direction="right" onClick={handleNextStall} />
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
