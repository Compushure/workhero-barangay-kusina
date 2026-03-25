'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

export default function CookingSection({ className = '' }: { className?: string }) {
  return (
    <Card
      className={`bg-transparent shadow-none border-none flex flex-col items-center gap-6 p-6 relative ${className}`}
    >
      <CardContent className="flex flex-col items-center gap-6 flex-1 justify-center w-full">
        {/* Placeholder dishes for future cooking implementation */}
        <div className="flex items-center justify-center gap-3 sm:gap-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`sinigang-placeholder-${index}`}
              className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-lg border-2 border-[#47331F]/60 bg-[#F5E7CF]/75 p-1 shadow-md"
            >
              <Image
                src="/assets/dish/food-sinigang.png"
                alt="Sinigang placeholder"
                fill
                className="object-contain p-1"
              />
            </div>
          ))}
        </div>

        {/* Main kitchen pot visual */}
        <div className="w-full flex justify-center">
          <div className="relative w-52 h-52 sm:w-64 sm:h-64 drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]">
            <Image
              src="/assets/kitchen-bg/kitchen-pot.png"
              alt="Kitchen pot"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
