'use client';

import { memo, useState } from 'react';
import { useGetUserBadges } from '@/hooks/tanstack/queries/employeeQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';

const BADGES_PER_PAGE = 3;
const NAV_BUTTON_CLASS =
  'group h-10 w-10 rounded-xl border border-gray-300 bg-card p-0 text-foreground shadow-sm/25 transition-all duration-400 ease-in-out hover:bg-accent-secondary hover:text-white disabled:pointer-events-none disabled:opacity-30';
const BADGE_CARD_CLASS =
  'h-full min-h-56 rounded-2xl border border-accent/25 bg-white p-5 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#F29F4A] hover:bg-[#FFF8EF] hover:shadow-sm';

interface BadgesCarouselProps {
  userId: string;
}

function BadgesCarouselComponent({ userId }: BadgesCarouselProps) {
  const { data: badges, isLoading } = useGetUserBadges(userId);
  const [currentPage, setCurrentPage] = useState(0);

  const badgeList = badges || [];
  const totalPages = Math.ceil(badgeList.length / BADGES_PER_PAGE);
  const startIdx = currentPage * BADGES_PER_PAGE;
  const endIdx = startIdx + BADGES_PER_PAGE;
  const currentBadges = badgeList.slice(startIdx, endIdx);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-300 bg-white p-5 sm:p-7 lg:p-8">
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-4 sm:gap-5">
          {[...Array(BADGES_PER_PAGE)].map((_, i) => (
            <Skeleton key={i} className="h-44 w-30 rounded-2xl bg-white sm:h-50 sm:w-36" />
          ))}
        </div>
      </div>
    );
  }

  if (!badgeList.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-300 bg-white py-12 text-center">
        <Trophy className="mb-2 h-10 w-10 text-accent/70" />
        <p className="text-sm text-muted-foreground">No badges earned yet</p>
      </div>
    );
  }

  const canGoBack = currentPage > 0;
  const canGoForward = currentPage < totalPages - 1;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl border border-gray-300 bg-white px-12 py-7 sm:px-16 sm:py-9 lg:px-20">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-white to-transparent sm:w-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-white to-transparent sm:w-20" />

        <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2 sm:left-5 lg:left-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={!canGoBack}
            className={NAV_BUTTON_CLASS}
            aria-label="Previous badge page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="absolute right-3 top-1/2 z-10 -translate-y-1/2 sm:right-5 lg:right-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={!canGoForward}
            className={NAV_BUTTON_CLASS}
            aria-label="Next badge page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {currentBadges.map((badge) => (
            <article key={badge.userbadge_id} className={BADGE_CARD_CLASS}>
              <div className="flex h-full flex-col text-center">
                {badge.img_link ? (
                  <div className="mx-auto mb-4 h-14 w-14 overflow-hidden rounded-xl sm:h-16 sm:w-16">
                    <img
                      src={badge.img_link}
                      alt={badge.badge_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/12 sm:h-16 sm:w-16">
                    <Trophy className="h-7 w-7 text-accent" />
                  </div>
                )}

                <h4 className="line-clamp-2 min-h-12 text-base font-semibold leading-tight text-title wrap-break-word">
                  {badge.badge_name}
                </h4>

                <p className="mt-2 line-clamp-2 min-h-11 text-sm leading-snug text-muted-foreground">
                  {badge.badge_description || 'No description provided.'}
                </p>

                <p className="mt-auto pt-3 text-xs text-muted-foreground">
                  Acquired:{' '}
                  {new Date(badge.date_acquired).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`h-1.5 rounded-full transition-colors ${
                i === currentPage ? 'w-4 bg-accent' : 'w-2 bg-accent/40'
              }`}
              aria-label={`Go to badge page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const BadgesCarousel = memo(BadgesCarouselComponent);
BadgesCarousel.displayName = 'BadgesCarousel';
