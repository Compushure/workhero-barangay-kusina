'use client';

import { MercadoStall } from './mercado-stall';
import { isMonthUnlocked } from './mercado-utils';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { X } from 'lucide-react';
import type { Reward } from '@/types';

interface MercadoStallsLayoutProps {
  onMonthSelect: (month: number | null) => void;
  selectedMonth?: number | null;
  rewards?: Reward[];
}

// Mapping of months to stall images
const STALL_IMAGES = [
  '/stalls/bakery_01.png', // January
  '/stalls/bakery_02.png', // February
  '/stalls/bakery_03.png', // March
  '/stalls/bakery_04.png', // April
  '/stalls/bakery_05.png', // May
  '/stalls/market_02.1.png', // June
  '/stalls/market_02.2.png', // July
  '/stalls/market_02.3.png', // August
  '/stalls/market_02.4.png', // September
  '/stalls/market_02.5.png', // October
  '/stalls/market_02.6.png', // November
  '/stalls/market_02.7.png', // December
];

// Group months into groups of 4
const MONTH_GROUPS = [
  [1, 2, 3, 4], // Q1
  [5, 6, 7, 8], // Q2
  [9, 10, 11, 12], // Q3+Q4
];

export function MercadoStallsLayout({
  onMonthSelect,
  selectedMonth: controlledSelectedMonth,
  rewards = [],
}: MercadoStallsLayoutProps) {
  // Use controlled prop if provided, otherwise manage internal state
  const selectedMonth = controlledSelectedMonth !== undefined ? controlledSelectedMonth : null;

  // Calculate items per month
  const itemsPerMonth = rewards.reduce(
    (acc, reward) => {
      if (reward.availableMonth) {
        acc[reward.availableMonth] = (acc[reward.availableMonth] || 0) + 1;
      }
      return acc;
    },
    {} as Record<number, number>
  );

  const handleStallClick = (month: number) => {
    // Don't allow selecting locked months
    if (!isMonthUnlocked(month)) {
      return;
    }

    if (selectedMonth === month) {
      // Deselect if clicking the same month
      onMonthSelect(null);
    } else {
      onMonthSelect(month);
    }
  };

  const handleClearSelection = () => {
    onMonthSelect(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      {selectedMonth && (
        <div className="flex items-center justify-center">
          <Button
            onClick={handleClearSelection}
            variant="outline"
            className="border-[#690003] text-[#690003] hover:bg-[#fbeaea]"
          >
            <X className="h-4 w-4 mr-2" />
            Show All Months
          </Button>
        </div>
      )}

      {/* Stalls Carousel - Shows 4 stalls at a time */}
      <div className="relative px-16">
        <Carousel
          opts={{
            align: 'start',
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent>
            {MONTH_GROUPS.map((group, groupIndex) => (
              <CarouselItem key={groupIndex}>
                <div className="grid grid-cols-4 gap-6 pb-12">
                  {group.map((month) => (
                    <MercadoStall
                      key={month}
                      month={month}
                      imageUrl={STALL_IMAGES[month - 1]}
                      isSelected={selectedMonth === month}
                      isLocked={!isMonthUnlocked(month)}
                      onClick={() => handleStallClick(month)}
                      itemCount={itemsPerMonth[month] || 0}
                    />
                  ))}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="border-[#690003] text-[#690003] hover:bg-[#fbeaea] hover:text-[#690003]" />
          <CarouselNext className="border-[#690003] text-[#690003] hover:bg-[#fbeaea] hover:text-[#690003]" />
        </Carousel>
      </div>
    </div>
  );
}
