'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { EmployeeTopRankEntry } from '@/types';
import { PortraitCard } from './portrait-card';

type LeaderboardMobileCarouselProps = {
  entries: EmployeeTopRankEntry[];
};

function chunkByTwo(entries: EmployeeTopRankEntry[]): EmployeeTopRankEntry[][] {
  const chunks: EmployeeTopRankEntry[][] = [];
  for (let i = 0; i < entries.length; i += 2) {
    chunks.push(entries.slice(i, i + 2));
  }
  return chunks;
}

export function LeaderboardMobileCarousel({ entries }: LeaderboardMobileCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const orderedEntries = useMemo(
    () => [...entries].sort((a, b) => a.rank - b.rank),
    [entries]
  );
  const slides = useMemo(() => chunkByTwo(orderedEntries), [orderedEntries]);

  const navigateToIndex = (nextIndex: number) => {
    if (slides.length === 0) return;
    const bounded = Math.max(0, Math.min(nextIndex, slides.length - 1));
    setActiveIndex(bounded);
  };

  if (slides.length === 0) return null;

  return (
    <section className="w-full max-w-[32rem] lg:hidden">
      <div className="rounded-2xl border-2 border-[#47331F] bg-[#3D2512]/75 px-2 py-3 shadow-xl sm:px-3">
        <div className="overflow-hidden pt-4" aria-label="Leaderboard cards">
          <div
            className="flex w-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
          {slides.map((slide, index) => (
              <div key={`slide-${index}`} className="w-full shrink-0 px-0.5 pb-1 sm:px-1">
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                {slide.map((entry) => (
                  <PortraitCard key={entry.userId} entry={entry} size="small" />
                ))}
                {slide.length === 1 && <div aria-hidden className="invisible" />}
              </div>
            </div>
          ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 px-1">
          <button
            type="button"
            onClick={() => navigateToIndex(activeIndex - 1)}
            disabled={activeIndex <= 0}
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#b07440] text-white shadow-[2px_2px_0_rgba(0,0,0,0.4)] transition-colors hover:bg-[#8A6342] disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <p className="min-w-0 text-center font-jersey text-sm tracking-widest text-[#F4B925]">
            {activeIndex + 1} / {slides.length}
          </p>

          <button
            type="button"
            onClick={() => navigateToIndex(activeIndex + 1)}
            disabled={activeIndex >= slides.length - 1}
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#b07440] text-white shadow-[-2px_2px_0_rgba(0,0,0,0.4)] transition-colors hover:bg-[#8A6342] disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
