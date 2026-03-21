'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { MercadoProvider, useMercadoContext } from './mercado-context';
import { NavLoadingState } from '@/components/employee/nav-loading-state';
import HeaderHUD from '../widgets/header-hud';

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

      <div className="absolute top-0 left-0 right-0 z-40">
        <HeaderHUD hideNotificationsOnMercado={false} />
      </div>

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
