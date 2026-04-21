'use client';

import { useMemo, useState } from 'react';
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
import { MercadoStallLoadingState } from './mercado-stall-loading-state';
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

function CarouselArrowButton({ direction, onClick }: CarouselArrowButtonProps) {
  const ArrowIcon = direction === 'left' ? ChevronLeft : ChevronRight;
  const altText = direction === 'left' ? 'Previous stall' : 'Next stall';

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-9 w-9 max-[380px]:h-10 max-[380px]:w-10 sm:h-10 sm:w-10 md:h-10 md:w-10 lg:h-12 lg:w-12 max-[640px]:p-2 shrink-0 items-center justify-center rounded-full wood-panel text-card shadow-md transition-all duration-200 hover:scale-105 hover:text-accent-secondary active:scale-95"
      aria-label={altText}
    >
      <ArrowIcon
        className="h-4 w-4 max-[380px]:h-4.5 max-[380px]:w-4.5 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 lg:h-6 lg:w-6"
        strokeWidth={2.3}
      />
    </button>
  );
}

function MercadoLayoutContent({ children }: MercadoLayoutClientProps) {
  const { setSelectedInterval } = useMercadoContext();
  // Load all rewards and interval-specific rewards to determine which stalls are open or closed.
  const { data: allRewards = [], isLoading: allRewardsLoading } = useGetRewards();
  const { data: weeklyRewards = [], isLoading: weeklyRewardsLoading } =
    useGetAvailableRewardsByInterval('weekly');
  const { data: monthlyRewards = [], isLoading: monthlyRewardsLoading } =
    useGetAvailableRewardsByInterval('monthly');
  const { data: yearlyRewards = [], isLoading: yearlyRewardsLoading } =
    useGetAvailableRewardsByInterval('yearly');
  const [carouselIndex, setCarouselIndex] = useState(0);

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
  const isStallsLoading =
    allRewardsLoading || weeklyRewardsLoading || monthlyRewardsLoading || yearlyRewardsLoading;

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
    <div className="relative isolate flex min-h-svh w-full flex-col overflow-hidden overscroll-none md:min-h-dvh">
      {/* Shows loading feedback for page-level navigation transitions. */}
      <NavLoadingState />
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat lg:bg-cover lg:bg-bottom"
        style={{ backgroundImage: `url(${MERCADO_BACKGROUND_IMAGE})` }}
        aria-hidden="true"
      />

      <div
        className="pointer-events-none fixed inset-0 z-1 bg-black/14 md:bg-black/16 lg:bg-black/18"
        aria-hidden="true"
      />

      {/* Top overlay HUD (profile/points/notifications) stays above the mercado background. */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 z-40 w-full"
        style={{
          paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
          paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
          paddingRight: 'max(0.5rem, env(safe-area-inset-right))',
        }}
      >
        <div className="pointer-events-auto flex w-full flex-col gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
          <HeaderHUD className="rounded-lg" />
        </div>
      </div>

      <main className="relative z-10 mx-auto flex w-full flex-1 min-w-0 items-end justify-center overflow-hidden px-2 pb-[max(env(safe-area-inset-bottom),3rem)] sm:px-3 sm:pb-[max(env(safe-area-inset-bottom),2.5rem)] md:px-4 md:pb-[max(env(safe-area-inset-bottom),2rem)] lg:px-4 lg:pb-4 xl:px-5 xl:pb-6">
        <div className="flex w-full flex-1 min-w-0 max-w-295 items-end justify-center">
          {isStallsLoading ? (
            <MercadoStallLoadingState />
          ) : (
            <>
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

              {/* Mobile/tablet: single-stall carousel with arrows anchored near stall edges. */}
              <div className="relative flex w-full min-w-0 max-w-lg items-center justify-center pb-1 sm:max-w-xl sm:pb-1 md:max-w-160 md:pb-1.5 lg:hidden">
                <div className="relative inline-flex w-auto translate-y-0 items-center justify-center sm:translate-y-1 md:translate-y-2">
                  <MercadoStallButton
                    stall={activeCarouselStall}
                    isClosed={closedByInterval[activeCarouselStall.interval]}
                    variant="mobile"
                    onSelect={handleStallClick}
                  />

                  <div className="absolute top-[64%] left-0 z-20 -translate-x-7 -translate-y-1/2 max-[380px]:-translate-x-6 sm:top-[64%] sm:-translate-x-7 md:top-[62%] md:-translate-x-6">
                    <CarouselArrowButton direction="left" onClick={handlePreviousStall} />
                  </div>

                  <div className="absolute top-[64%] right-0 z-20 translate-x-7 -translate-y-1/2 max-[380px]:translate-x-6 sm:top-[64%] sm:translate-x-7 md:top-[62%] md:translate-x-6">
                    <CarouselArrowButton direction="right" onClick={handleNextStall} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

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
