'use client';

import { memo, useState } from 'react';
import { useGetUserBadges } from '@/hooks/tanstack/queries/employeeQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';

const BADGES_PER_PAGE = 5;

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
      <div className="space-y-4">
        <div className="flex gap-3">
          {[...Array(BADGES_PER_PAGE)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-28 rounded-lg flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (!badgeList.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Trophy className="h-12 w-12 text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">No badges earned yet</p>
      </div>
    );
  }

  const canGoBack = currentPage > 0;
  const canGoForward = currentPage < totalPages - 1;

  return (
    <div className="space-y-4">
      {/* Carousel Container */}
      <div className="flex items-center gap-3">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={!canGoBack}
          className="flex-shrink-0 h-10 w-10 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Badges Grid (5 per page) */}
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-3 transition-transform duration-300">
            {currentBadges.map((badge) => (
              <Tooltip key={badge.userbadge_id}>
                <TooltipTrigger asChild>
                  <div className="flex-shrink-0 w-28 h-32 flex flex-col items-center justify-start p-2 rounded-lg border-2 border-[#730202]/10 hover:border-[#730202]/30 transition-colors bg-[#730202]/5 hover:bg-[#730202]/10 cursor-pointer">
                    {/* Badge Image */}
                    {badge.img_link ? (
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden mb-2 flex-shrink-0">
                        <img
                          src={badge.img_link}
                          alt={badge.badge_name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-[#730202]/20 flex items-center justify-center mb-2 flex-shrink-0">
                        <Trophy className="h-8 w-8 text-[#730202]" />
                      </div>
                    )}

                    {/* Badge Info */}
                    <div className="w-full text-center flex-1 flex flex-col justify-between min-h-16">
                      <div>
                        <h4 className="text-xs font-bold text-[#730202] line-clamp-2 mb-1">
                          {badge.badge_name}
                        </h4>
                        {badge.badge_description && (
                          <p className="text-[10px] text-muted-foreground/80 line-clamp-2">
                            {badge.badge_description}
                          </p>
                        )}
                      </div>
                      <p className="text-[10px] font-semibold text-muted-foreground mt-1">
                        {new Date(badge.date_acquired).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white max-w-56">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-white">
                      {badge.badge_name || 'Badge'}
                    </p>
                    {badge.badge_description && (
                      <p className="text-[11px] text-white/80">{badge.badge_description}</p>
                    )}
                    <p className="text-[11px] text-white/80">
                      Acquired:{' '}
                      {new Date(badge.date_acquired).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
          disabled={!canGoForward}
          className="flex-shrink-0 h-10 w-10 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Page Indicator */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 text-xs text-muted-foreground">
          <span>
            Page {currentPage + 1} of {totalPages}
          </span>
          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`h-2 rounded-full transition-colors ${
                  i === currentPage ? 'bg-[#730202] w-3' : 'bg-[#730202]/30 w-2'
                }`}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const BadgesCarousel = memo(BadgesCarouselComponent);
BadgesCarousel.displayName = 'BadgesCarousel';
