'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  MercadoProvider,
  useMercadoContext,
} from '../../../components/employee/mercado/mercado-context';
import { useMercadoPageData } from '@/hooks/useMercadoPageData';
import { LogOutBtn } from '@/components/employee/attendance/logout';
import { Coins } from 'lucide-react';

interface MercadoLayoutProps {
  children: React.ReactNode;
}

interface QuickNavItem {
  label: string;
  href: string;
}

interface IntervalStall {
  interval: 'weekly' | 'monthly' | 'yearly';
  label: string;
  image: string;
}

const QUICK_NAV_ITEMS: QuickNavItem[] = [
  { label: 'Dashboard', href: '/employee/dashboard' },
  { label: 'Tasks', href: '/employee/tasks' },
  { label: 'Mercado', href: '/employee/mercado' },
];

const INTERVAL_STALLS: IntervalStall[] = [
  { interval: 'weekly', label: 'Weekly', image: '/mercado/market_02.8.png' },
  { interval: 'monthly', label: 'Monthly', image: '/mercado/bakery_01.png' },
  { interval: 'yearly', label: 'Yearly', image: '/mercado/market_02.5.png' },
];

function MercadoLayoutContent({ children }: MercadoLayoutProps) {
  const pathname = usePathname();
  const { setSelectedInterval } = useMercadoContext();
  const { userPoints, isLoading } = useMercadoPageData();

  const handleStallClick = (interval: 'weekly' | 'monthly' | 'yearly') => {
    setSelectedInterval(interval);
  };

  return (
    <div className="relative h-screen w-full">
      {/* Background Image */}
      <Image
        src="/mercado/mercado-bg.svg"
        alt="Mercado Background"
        fill
        className="object-cover object-center"
        priority
        quality={100}
      />

      {/* Points Bar */}
      <div className="absolute top-4 right-4 z-40 md:top-6 md:right-6 flex flex-col items-end gap-3">
        <div className="w-full max-w-md bg-linear-to-r from-amber-50/95 to-orange-50/95 backdrop-blur-sm border-2 border-[#690003]/30 rounded-xl shadow-lg px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Coins className="h-8 w-8 text-amber-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <p className="text-xs text-[#7a3d3d] font-medium">Fiesta Points</p>
                <p className="text-2xl font-bold text-[#690003] pixelated-text">
                  {isLoading ? '...' : userPoints.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <LogOutBtn />
      </div>

      {/* Quick Navigation */}
      <div className="absolute top-4 left-4 z-40 md:top-6 md:left-6">
        <div className="flex items-center gap-2 rounded-xl border border-[#690003]/30 bg-linear-to-r from-amber-50/95 to-orange-50/95 p-2 shadow-lg backdrop-blur-sm">
          {QUICK_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-xs md:text-sm font-semibold transition-colors',
                  isActive ? 'bg-[#690003] text-white' : 'text-[#690003] hover:bg-[#690003]/10'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex h-full w-full items-end justify-center pt-20 pb-0 md:pt-24 md:pb-0">
        {/* Stalls Container */}
        <div className="flex h-full w-full max-w-7xl items-end justify-center px-10 translate-y-0 md:px-16 md:translate-y-0 lg:px-20 lg:translate-y-0 pb-0 md:pb-0">
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
                  {/* Month label */}
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

export default function MercadoLayout({ children }: MercadoLayoutProps) {
  return (
    <MercadoProvider>
      <MercadoLayoutContent>{children}</MercadoLayoutContent>
    </MercadoProvider>
  );
}
