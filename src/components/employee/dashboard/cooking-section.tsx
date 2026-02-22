'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CookingSection({ className = '' }: { className?: string }) {
  return (
    <Card
      className={`bg-transparent shadow-none border-none flex flex-col items-center gap-6 p-6 relative ${className}`}
    >
      <CardContent className="flex flex-col items-center gap-6 flex-1 justify-center w-full">
        {/* Main pot */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-red-100 rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-md">
          🍲
        </div>

        {/* Bowls container */}
        <div className="relative flex gap-2 sm:gap-4 flex-wrap justify-center w-full">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-200 rounded-full flex items-center justify-center text-xl sm:text-2xl shadow-md"
            >
              🍜
            </div>
          ))}

          {/* Donate button */}
          <Button
            variant="secondary"
            size="sm"
            // Mobile: pinned bottom-right of card
            // Desktop: beside bowls (top-right of bowls container)
            className="absolute bottom-4 right-4 sm:static sm:ml-4 sm:self-center"
            onClick={() => console.log('Donate triggered')}
          >
            Donate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
