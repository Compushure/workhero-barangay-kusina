import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { getGeneratedRankings } from '@/actions/hr/leaderboard';
import PodiumGrid from '@/components/hr/leaderboard/podium-grid';
import RemainingPlayersGrid from '@/components/hr/leaderboard/remaining-players-grid';
import { RankingCard } from '@/components/hr/leaderboard/ranking-card';
import { enrichRankingPlayers } from '@/lib/utils/enrich-ranking';
import { getPeriodDateRangeSubtitle } from '@/lib/utils/time-period-utils';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import type { RankLogPeriodType, LeaderboardPlayer } from '@/types';

const PAGE_SIZE = 8;

interface LeaderboardContentProps {
  periodType: RankLogPeriodType;
  selectedId: string | undefined;
  currentPage: number;
}

export async function LeaderboardContent({
  periodType,
  selectedId,
  currentPage,
}: LeaderboardContentProps) {
  const result = await getGeneratedRankings(periodType);
  const rankings = result.data ?? [];

  const latestRankingId = rankings[0]?.id;

  const totalPages = Math.ceil(rankings.length / PAGE_SIZE);
  const clampedPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
  const pagedRankings = rankings.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);
  const emptySlots = totalPages > 1 ? Math.max(0, PAGE_SIZE - pagedRankings.length) : 0;

  const selectedRanking = selectedId ? rankings.find((r) => r.id === selectedId) : undefined;

  let enrichedPlayers: (LeaderboardPlayer & { rank: number })[] = [];
  if (selectedRanking) {
    const supabase = await createClient();
    enrichedPlayers = await enrichRankingPlayers(selectedRanking, supabase);
  }

  const top3 = enrichedPlayers.slice(0, 3);
  const remaining = enrichedPlayers.slice(3, 10);

  if (selectedRanking) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#6D1616]">{selectedRanking.period_label}</h2>
            {getPeriodDateRangeSubtitle(selectedRanking) && (
              <p className="text-sm text-gray-600 mt-0.5">
                {getPeriodDateRangeSubtitle(selectedRanking)}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Generated on{' '}
              {new Date(selectedRanking.generated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
          <Link
            href={`/hr/leaderboard?type=${periodType}`}
            className="text-sm text-[#6D1616] hover:underline"
          >
            ← Back to list
          </Link>
        </div>

        <PodiumGrid top3={top3} />
        <RemainingPlayersGrid players={remaining} />
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-5xl mx-auto">
      {rankings.length === 0 ? (
        <div className="flex justify-center py-8 sm:py-12">
          <div className="w-full max-w-2xl bg-[#FBF4E8] rounded-2xl border border-[#E9C496] shadow-md overflow-hidden">
            <div className="bg-linear-to-r from-[#EBCBA8] to-[#E9C496] px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[#6D1616]" />
              </div>
              <h3 className="text-xl font-bold text-[#6D1616]">No Rankings Yet</h3>
            </div>
            <div className="px-6 py-6">
              <p className="text-[#5a2a2a] text-base">
                No {periodType} rankings have been generated yet. Use the &ldquo;Generate
                Ranking&rdquo; button above to create one.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {pagedRankings.map((ranking) => (
            <RankingCard
              key={ranking.id}
              ranking={ranking}
              periodType={periodType}
              isLatest={ranking.id === latestRankingId}
            />
          ))}

          {emptySlots > 0 &&
            Array.from({ length: emptySlots }, (_, idx) => (
              <div
                key={`ranking-spacer-${idx}`}
                className="invisible bg-white rounded-xl border border-gray-200 shadow-sm"
                aria-hidden="true"
              >
                <div className="px-4 sm:px-6 py-6 sm:py-8">
                  <div className="h-11" />
                </div>
              </div>
            ))}
        </>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={
                  clampedPage > 1
                    ? `/hr/leaderboard?type=${periodType}&page=${clampedPage - 1}`
                    : undefined
                }
                aria-disabled={clampedPage <= 1}
                className={cn(clampedPage <= 1 && 'pointer-events-none opacity-50')}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const isFirst = page === 1;
              const isLast = page === totalPages;
              const isNearCurrent = Math.abs(page - clampedPage) <= 1;

              if (!isFirst && !isLast && !isNearCurrent) {
                if (page === 2 || page === totalPages - 1) {
                  return (
                    <PaginationItem key={`ellipsis-${page}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              }

              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href={`/hr/leaderboard?type=${periodType}&page=${page}`}
                    isActive={page === clampedPage}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                href={
                  clampedPage < totalPages
                    ? `/hr/leaderboard?type=${periodType}&page=${clampedPage + 1}`
                    : undefined
                }
                aria-disabled={clampedPage >= totalPages}
                className={cn(clampedPage >= totalPages && 'pointer-events-none opacity-50')}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
