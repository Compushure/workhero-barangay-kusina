'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import mercadoBackground from '../../../../public/mercado/mercado-bg.png';
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

const MERCADO_BACKGROUND_IMAGE = mercadoBackground.src;

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
    // Watch viewport width for respsiveness
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
  const ArrowIcon = direction === 'left' ? ChevronLeft : ChevronRight;
  const altText = direction === 'left' ? 'Previous stall' : 'Next stall';

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#9b7a56] bg-[#f6eddd] text-[#4b3522] shadow-[0_2px_6px_rgba(75,53,34,0.18)] transition-all duration-200 hover:scale-110 active:scale-95"
      aria-label={altText}
    >
      <ArrowIcon
        className="h-5 w-5 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 lg:h-7 lg:w-7"
        strokeWidth={2.3}
      />
    </button>
  );
}

function MercadoLayoutContent({ children }: MercadoLayoutClientProps) {
  const { setSelectedInterval } = useMercadoContext();
  // Load all rewards and interval-specific rewards to determine which stalls are open or closed.
  const { data: allRewards = [] } = useGetRewards();
  const { data: weeklyRewards = [] } = useGetAvailableRewardsByInterval('weekly');
  const { data: monthlyRewards = [] } = useGetAvailableRewardsByInterval('monthly');
  const { data: yearlyRewards = [] } = useGetAvailableRewardsByInterval('yearly');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const isTabletOrLarger = useIsTabletOrLarger();

  // Build quick counts for each interval so the stall-state helper can decide availability.
  const availableCounts = useMemo(
    () =>
      buildIntervalCounts({
        weekly: weeklyRewards.length,
        monthly: monthlyRewards.length,
        yearly: yearlyRewards.length,
      }),
    [weeklyRewards.length, monthlyRewards.length, yearlyRewards.length]
  );

  // Compute open/closed state per interval (weekly/monthly/yearly) from rewards and counts.
  const closedByInterval = useMemo(
    () => buildClosedByInterval(allRewards, availableCounts),
    [allRewards, availableCounts]
  );

  const handleStallClick = (interval: 'weekly' | 'monthly' | 'yearly') => {
    // Guard: do nothing when the selected stall is currently closed.
    if (closedByInterval[interval]) {
      return;
    }
    // Open the rewards modal for the chosen interval.
    setSelectedInterval(interval);
  };

  const handlePreviousStall = () => {
    setCarouselIndex((prev) => (prev === 0 ? INTERVAL_STALLS.length - 1 : prev - 1));
  };

  const handleNextStall = () => {
    setCarouselIndex((prev) => (prev === INTERVAL_STALLS.length - 1 ? 0 : prev + 1));
  };

  // Mobile/tablet shows one active stall card at a time.
  // Keeping index at 0 ensures Weekly is shown first by default on smaller screens.
  const activeCarouselStall = INTERVAL_STALLS[carouselIndex];

  return (
    <div
      className="relative h-svh min-h-svh max-h-svh w-full overflow-hidden overscroll-none bg-[#9b642f] bg-cover bg-bottom bg-no-repeat"
      style={{ backgroundImage: `url(${MERCADO_BACKGROUND_IMAGE})` }}
    >
      {/* Shows loading feedback for page-level navigation transitions. */}
      <NavLoadingState />
      <Image
        src={MERCADO_BACKGROUND_IMAGE}
        alt="Mercado Background"
        fill
        className="object-cover object-center sm:object-bottom saturate-[0.82] brightness-[0.84] contrast-[0.96]"
        sizes="100vw"
        priority
        quality={100}
      />

      {/* Muted overlay to make foreground stalls more readable on all screen sizes. */}
      <div className="pointer-events-none absolute inset-0 z-1 bg-linear-to-b from-[#2a1d12]/8 via-[#2a1d12]/10 to-[#2a1d12]/14" />

      {/* Top overlay HUD (profile/points/notifications) stays above the mercado background. */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 z-40 w-full px-2 sm:px-3 md:px-4 lg:px-6 pt-2 sm:pt-2.5 md:pt-4 lg:pt-6">
        <div className="pointer-events-auto flex w-full flex-col gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
          <HeaderHUD className="rounded-lg" hideNotificationsOnMercado={false} />
        </div>
      </div>

      <div className="relative z-10 flex h-full w-full items-end justify-center overflow-hidden px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] sm:px-3 sm:pb-2 md:px-4 md:pb-3 lg:px-6 lg:pb-4 xl:px-8 xl:pb-6">
        <div className="flex h-full w-full max-w-7xl items-end justify-center">
          {/* Desktop: 3 stalls grid (lg+) */}
          <div className="hidden items-end justify-center gap-6 sm:gap-8 md:gap-10 lg:flex lg:gap-12 xl:gap-16">
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

          {/* Mobile/tablet: single-stall carousel controlled by left/right arrows. */}
          <div className="flex w-full items-center justify-center gap-2.5 pb-1 sm:gap-3 sm:pb-1.5 md:gap-4 md:pb-2 lg:hidden">
            <CarouselArrowButton direction="left" onClick={handlePreviousStall} />
            <MercadoStallButton
              stall={activeCarouselStall}
              isClosed={closedByInterval[activeCarouselStall.interval]}
              variant={isTabletOrLarger ? 'desktop' : 'mobile'}
              onSelect={handleStallClick}
            />
            <CarouselArrowButton direction="right" onClick={handleNextStall} />
          </div>
        </div>
      </div>

      {/* Child content contains interval modal content rendered by the page component. */}
      <div className="relative z-50">{children}</div>
    </div>
  );
}

export function MercadoLayoutClient({ children }: MercadoLayoutClientProps) {
  return (
    // Provider shares selected interval state between stall buttons and reward modal.
    <MercadoProvider>
      <MercadoLayoutContent>{children}</MercadoLayoutContent>
    </MercadoProvider>
  );
}
