'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  MercadoProvider,
  useMercadoContext,
} from '../../../components/employee/mercado/mercado-context';
import { useMercadoPageData } from '@/hooks/useMercadoPageData';
import { Coins } from 'lucide-react';

interface MercadoLayoutProps {
  children: React.ReactNode;
}

interface QuickNavItem {
  label: string;
  href: string;
}

interface MonthStall {
  month: number;
  image: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const QUICK_NAV_ITEMS: QuickNavItem[] = [
  { label: 'Dashboard', href: '/employee/dashboard' },
  { label: 'Tasks', href: '/employee/tasks' },
  { label: 'Mercado', href: '/employee/mercado' },
];

const MONTH_STALLS: MonthStall[] = [
  { month: 1, image: '/mercado/market_02.1.png' },
  { month: 2, image: '/mercado/market_02.2.png' },
  { month: 3, image: '/mercado/market_02.3.png' },
  { month: 4, image: '/mercado/market_02.4.png' },
  { month: 5, image: '/mercado/market_02.5.png' },
  { month: 6, image: '/mercado/market_02.6.png' },
  { month: 7, image: '/mercado/market_02.7.png' },
  { month: 8, image: '/mercado/market_02.8.png' },
  { month: 9, image: '/mercado/bakery_01.png' },
  { month: 10, image: '/mercado/bakery_02.png' },
  { month: 11, image: '/mercado/bakery_03.png' },
  { month: 12, image: '/mercado/bakery_04.png' },
];

const STALLS_PER_VIEW = 3;

function MercadoLayoutContent({ children }: MercadoLayoutProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const pathname = usePathname();
  const { setSelectedMonth } = useMercadoContext();
  const { userPoints, deductedPoints, isLoading } = useMercadoPageData();

  const maxSlide = Math.max(0, Math.ceil(MONTH_STALLS.length / STALLS_PER_VIEW) - 1);
  const isAtFirstSlide = currentSlide === 0;
  const isAtLastSlide = currentSlide === maxSlide;

  const visibleStalls = useMemo(() => {
    const start = currentSlide * STALLS_PER_VIEW;
    return MONTH_STALLS.slice(start, start + STALLS_PER_VIEW);
  }, [currentSlide]);

  const availablePoints = useMemo(() => userPoints - deductedPoints, [userPoints, deductedPoints]);

  const handlePrevious = () => {
    if (isAtFirstSlide) return;
    setCurrentSlide((prev) => prev - 1);
  };

  const handleNext = () => {
    if (isAtLastSlide) return;
    setCurrentSlide((prev) => prev + 1);
  };

  const handleStallClick = (month: number) => {
    setSelectedMonth(month);
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
      <div className="absolute top-4 right-4 z-40 md:top-6 md:right-6">
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
                  {isLoading ? '...' : availablePoints.toLocaleString()}
                </p>
              </div>
            </div>
            {deductedPoints > 0 && (
              <div className="text-right">
                <p className="text-xs text-[#7a3d3d]">Pending</p>
                <p className="text-sm font-semibold text-orange-600">
                  -{deductedPoints.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
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
      <div className="relative z-10 flex h-full w-full items-end justify-center pt-20 pb-3 md:pt-24 md:pb-2">
        {/* Left Arrow Button */}
        <button
          onClick={handlePrevious}
          disabled={isAtFirstSlide}
          className={cn(
            'absolute left-1 z-20 -translate-y-2 pb-2 md:pb-32 md:left-2 lg:left-3 xl:left-4 pl-8',
            isAtFirstSlide
              ? 'opacity-40 cursor-not-allowed'
              : 'transition-transform hover:scale-110 active:scale-95'
          )}
          aria-label="Previous stalls"
        >
          <Image
            src="/mercado/left-arrow.png"
            alt="Previous"
            width={72}
            height={72}
            className="h-10 w-10 md:h-14 md:w-14 lg:h-18 lg:w-18"
          />
        </button>

        {/* Carousel Container */}
        <div className="flex h-full w-full max-w-7xl items-end justify-center px-24 translate-y-4 md:px-36 md:translate-y-6 lg:px-44 lg:translate-y-8 pb-3 md:pb-6">
          <div className="flex items-end justify-center gap-1 md:gap-4 lg:gap-6">
            {visibleStalls.map((stall) => {
              const monthName = MONTH_NAMES[stall.month - 1];

              return (
                <button
                  key={stall.month}
                  onClick={() => handleStallClick(stall.month)}
                  className={cn(
                    'relative shrink-0 transition-all duration-300',
                    'h-66 w-66 md:h-84 md:w-84 lg:h-100 lg:w-100',
                    'hover:scale-105 active:scale-95 cursor-pointer group'
                  )}
                  aria-label={`View ${monthName} market`}
                >
                  <Image
                    src={stall.image}
                    alt={`${monthName} market stall`}
                    fill
                    className="object-contain pixelated"
                    sizes="(max-width: 768px) 280px, (max-width: 1024px) 350px, 420px"
                  />
                  {/* Month label */}
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                    <div className="bg-[#690003]/90 text-white px-5 py-2.5 rounded-lg text-base font-bold pixelated-text whitespace-nowrap">
                      {monthName}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={handleNext}
          disabled={isAtLastSlide}
          className={cn(
            'absolute right-1 z-20 -translate-y-2 pb-2 md:pb-32 md:right-2 lg:right-3 xl:right-4 pr-8',
            isAtLastSlide
              ? 'opacity-40 cursor-not-allowed'
              : 'transition-transform hover:scale-110 active:scale-95'
          )}
          aria-label="Next stalls"
        >
          <Image
            src="/mercado/right-arrow.png"
            alt="Next"
            width={72}
            height={72}
            className="h-10 w-10 md:h-14 md:w-14 lg:h-18 lg:w-18"
          />
        </button>
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
