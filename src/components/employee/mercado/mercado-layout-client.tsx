'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { MercadoProvider, useMercadoContext } from './mercado-context';
import { useMercadoPageData } from '@/hooks/useMercadoPageData';
import { LogOutBtn } from '@/components/employee/attendance/logout';
import { NotificationsPopover } from '@/components/notifications/notifications';
import { MapLauncher } from '@/components/employee/minimap/map-launcher';
import { Coins } from 'lucide-react';
import { NavLoadingState } from '@/components/employee/nav-loading-state';

interface MercadoLayoutClientProps {
  children: React.ReactNode;
}

interface IntervalStall {
  interval: 'weekly' | 'monthly' | 'yearly';
  label: string;
  image: string;
}

const INTERVAL_STALLS: IntervalStall[] = [
  { interval: 'weekly', label: 'Weekly', image: '/mercado/market_02.8.png' },
  { interval: 'monthly', label: 'Monthly', image: '/mercado/bakery_01.png' },
  { interval: 'yearly', label: 'Yearly', image: '/mercado/market_02.5.png' },
];

function MercadoLayoutContent({ children }: MercadoLayoutClientProps) {
  const { setSelectedInterval } = useMercadoContext();
  const { userPoints, isLoading } = useMercadoPageData();

  const marketControlStyles = {
    shell: 'bg-[#765332] border-3 border-[#47331F] rounded-lg',
    label: 'text-sm text-[#F5E8D6]/90 font-medium',
    value: 'text-2xl font-bold text-[#F5E8D6] pixelated-text',
    iconWrap:
      'flex items-center justify-center w-12 h-12 rounded-full bg-[#E89C30] border-2 border-[#47331F] shrink-0',
    bellTrigger:
      'h-16 w-16 rounded-full bg-[#765332] border-3 border-[#47331F] text-[#F5E8D6] hover:scale-105 hover:bg-[#765332] hover:text-[#F5E8D6] transition-all shadow-none',
    bellIcon: 'h-8 w-8',
    bellBadge: 'bg-[#E89C30] text-[#690003] border border-[#47331F] font-bold',
  };

  const handleStallClick = (interval: 'weekly' | 'monthly' | 'yearly') => {
    setSelectedInterval(interval);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <NavLoadingState />
      <Image
        src="/mercado/mercado-bg.svg"
        alt="Mercado Background"
        fill
        className="object-cover object-bottom"
        priority
        quality={100}
      />

      <div className="absolute top-4 left-4 z-40 flex items-start gap-3 md:top-6 md:left-6">
        <div className={cn('w-40 px-4 py-3 md:w-50', marketControlStyles.shell)}>
          <div className="flex items-center gap-3">
            <div className={marketControlStyles.iconWrap}>
              <Coins className="h-7 w-7 text-[#690003]" />
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

      <div className="relative z-10 flex h-full w-full items-end justify-center overflow-hidden pt-20 pb-0 md:pt-24 md:pb-0">
        <div className="flex h-full w-full max-w-7xl items-end justify-center px-10 translate-y-0 pb-0 md:px-16 md:translate-y-0 md:pb-0 lg:px-20 lg:translate-y-0">
          <div className="flex items-end justify-center gap-0 md:gap-2 lg:gap-3">
            {INTERVAL_STALLS.map((stall) => {
              const intervalLabel = stall.label;

              return (
                <button
                  key={stall.interval}
                  onClick={() => handleStallClick(stall.interval)}
                  className={cn(
                    'relative shrink-0 transition-all duration-300',
                    'h-80 w-80 md:h-100 md:w-100 lg:h-120 lg:w-120',
                    'hover:scale-105 active:scale-95 cursor-pointer group'
                  )}
                  aria-label={`View ${intervalLabel} market`}
                >
                  <Image
                    src={stall.image}
                    alt={`${intervalLabel} market stall`}
                    fill
                    className="object-contain pixelated"
                    sizes="(max-width: 768px) 280px, (max-width: 1024px) 350px, 420px"
                  />
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                    <div className="bg-[#690003]/90 text-white px-5 py-2.5 rounded-lg text-base font-bold pixelated-text whitespace-nowrap">
                      {intervalLabel}
                    </div>
                  </div>
                </button>
              );
            })}
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
