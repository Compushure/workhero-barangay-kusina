'use client';

import { useState, useMemo, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Pagination } from '@/components/shared/pagination';
import VisibilityToggle from '@/components/hr/leaderboard/visibility-toggle';
import type { LeaderboardPlayer } from '@/types';

const PAGE_SIZE = 10;

interface LeaderboardTableProps {
  players: (LeaderboardPlayer & { rank: number })[];
  periodLabel: string;
  dateRangeSubtitle: string | null;
  rankingPeriodId: string;
  isVisible: boolean;
}

function RankCell({ rank }: { rank: number }) {
  return <span className="text-h2 font-semibold text-foreground">{rank}</span>;
}

export default function LeaderboardTable({
  players,
  periodLabel,
  dateRangeSubtitle,
  rankingPeriodId,
  isVisible,
}: LeaderboardTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const isOptimisticRanking = rankingPeriodId.startsWith('optimistic-');

  const totalPages = Math.max(1, Math.ceil(players.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedPlayers = useMemo(
    () => players.slice(startIndex, endIndex),
    [players, startIndex, endIndex]
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [players.length, currentPage, totalPages]);

  if (players.length === 0) {
    return (
      <div className="rounded-3xl border border-accent/20 bg-card px-8 py-12 text-center shadow-sm/40">
        <p className="text-h2 text-foreground">No players to display</p>
        <p className="mt-1 text-meta text-muted-foreground">
          Generate a ranking period to start tracking employee performance.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full overflow-hidden rounded-3xl border border-accent/20 bg-card shadow-sm/40">
        {/* Period header */}
        <div className="flex flex-col gap-3 border-b border-border bg-muted/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Active Period
            </p>
            <h2 className="text-h1 text-foreground">{periodLabel}</h2>
            {dateRangeSubtitle && (
              <p className="text-meta text-muted-foreground">{dateRangeSubtitle}</p>
            )}
          </div>
          <VisibilityToggle
            rankingPeriodId={rankingPeriodId}
            isVisible={isVisible}
            disabled={isOptimisticRanking}
            className="control-h rounded-full px-4"
          />
        </div>

        <div className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <Table className="min-w-248">
            <TableHeader>
              <TableRow className="bg-primary-gradient border-0 text-card hover:opacity-95">
                <TableHead className="w-10 whitespace-nowrap pl-1 pr-1 text-[11px] font-semibold uppercase tracking-wide text-current sm:w-20 sm:pl-6 sm:pr-4">
                  Rank
                </TableHead>
                <TableHead className="min-w-36 whitespace-nowrap pl-1 text-[11px] font-semibold uppercase tracking-wide text-current sm:min-w-60 sm:pl-0">
                  Name
                </TableHead>
                <TableHead className="whitespace-nowrap pr-1.5 text-right text-[11px] font-semibold uppercase tracking-wide text-current sm:pr-5">
                  <span className="sm:hidden">Tasks Completed</span>
                  <span className="hidden sm:inline">Total Completed Tasks</span>
                </TableHead>
                <TableHead className="whitespace-nowrap pr-1.5 text-right text-[11px] font-semibold uppercase tracking-wide text-current sm:pr-5">
                  <span className="sm:hidden">Task Pts</span>
                  <span className="hidden sm:inline">Task Points</span>
                </TableHead>
                <TableHead className="whitespace-nowrap pr-1.5 text-right text-[11px] font-semibold uppercase tracking-wide text-current sm:pr-5">
                  <span className="sm:hidden">Badge Pts</span>
                  <span className="hidden sm:inline">Badge Points</span>
                </TableHead>
                <TableHead className="whitespace-nowrap pr-3 text-right text-[11px] font-semibold uppercase tracking-wide text-current sm:pr-6">
                  <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                    <span className="sm:hidden">Score</span>
                    <span className="hidden sm:inline">Performance Score</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info
                            className="h-3.5 w-3.5 shrink-0 cursor-help text-card/90 hover:text-card sm:size-4"
                            aria-label="How performance score is calculated"
                          />
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <p className="text-sm text-foreground">
                            Performance Score = (Badge Points + Task Points) × Completed Tasks
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isOptimisticRanking
                ? Array.from({ length: PAGE_SIZE }).map((_, index) => (
                    <TableRow
                      key={`optimistic-skeleton-${index}`}
                      className="border-0 bg-background-soft hover:bg-background-soft"
                    >
                      <TableCell className="py-3 pl-2 pr-2 sm:py-4 sm:pl-6 sm:pr-5">
                        <div className="h-6 w-8 animate-pulse rounded bg-gray-300" />
                      </TableCell>
                      <TableCell className="py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="h-9 w-9 animate-pulse rounded-full bg-gray-300 sm:h-12 sm:w-12" />
                          <div className="h-4 w-36 animate-pulse rounded bg-gray-300 sm:h-5 sm:w-48" />
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-3 pr-2 text-right sm:py-4 sm:pr-5">
                        <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-300 sm:h-5" />
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-3 pr-2 text-right sm:py-4 sm:pr-5">
                        <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-300 sm:h-5" />
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-3 pr-2 text-right sm:py-4 sm:pr-5">
                        <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-300 sm:h-5" />
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-3 pr-3 text-right sm:py-4 sm:pr-6">
                        <div className="ml-auto h-5 w-20 animate-pulse rounded bg-gray-300" />
                      </TableCell>
                    </TableRow>
                  ))
                : paginatedPlayers.map((player) => (
                    <TableRow
                      key={player.id}
                      className="border-0 bg-card transition-colors hover:bg-background"
                    >
                      <TableCell className="py-3 pl-2 pr-2 sm:py-4 sm:pl-6 sm:pr-5">
                        <RankCell rank={player.rank} />
                      </TableCell>
                      <TableCell className="py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Avatar className="h-9 w-9 border-2 border-background sm:h-12 sm:w-12">
                            <AvatarImage src={player.image ?? undefined} alt={player.name} />
                            <AvatarFallback className="bg-muted text-sm font-semibold text-foreground">
                              {player.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="line-clamp-1 text-base font-semibold text-foreground">
                            {player.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-3 pr-2 text-right sm:py-4 sm:pr-5">
                        <span className="text-button font-semibold text-foreground">
                          {player.totalCompletedTasks.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-3 pr-2 text-right sm:py-4 sm:pr-5">
                        <span className="text-button font-semibold text-foreground">
                          {player.taskPoints.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-3 pr-2 text-right sm:py-4 sm:pr-5">
                        <span className="text-button font-semibold text-foreground">
                          {player.badgePoints.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-3 pr-3 text-right sm:py-4 sm:pr-6">
                        <span className="text-button font-semibold text-primary">
                          {player.performanceScore.toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
              {Array.from({ length: PAGE_SIZE - paginatedPlayers.length }).map((_, i) => (
                <TableRow
                  key={`placeholder-${i}`}
                  className="pointer-events-none border-0 select-none"
                  aria-hidden="true"
                >
                  <TableCell className="py-3 pl-2 pr-2 sm:py-4 sm:pl-6 sm:pr-5">
                    <span className="invisible text-h2 font-semibold">0</span>
                  </TableCell>
                  <TableCell className="py-3 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="invisible h-9 w-9 sm:h-12 sm:w-12" />
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-3 pr-2 text-right sm:py-4 sm:pr-5">
                    <span className="invisible text-button font-semibold">0</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-3 pr-2 text-right sm:py-4 sm:pr-5">
                    <span className="invisible text-button font-semibold">0</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-3 pr-2 text-right sm:py-4 sm:pr-5">
                    <span className="invisible text-button font-semibold">0</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-3 pr-3 text-right sm:py-4 sm:pr-6">
                    <span className="invisible text-button font-semibold">0</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className={totalPages <= 1 ? 'invisible' : ''}>
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
