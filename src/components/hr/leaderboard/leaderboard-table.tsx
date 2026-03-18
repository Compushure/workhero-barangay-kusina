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
import type { LeaderboardPlayer } from '@/types';

const PAGE_SIZE = 10;

interface LeaderboardTableProps {
  players: (LeaderboardPlayer & { rank: number })[];
  periodLabel: string;
  dateRangeSubtitle: string | null;
  rankingPeriodId: string;
}

function RankCell({ rank }: { rank: number }) {
  return <span className="text-xl font-semibold text-foreground">{rank}</span>;
}

export default function LeaderboardTable({
  players,
  periodLabel,
  dateRangeSubtitle,
  rankingPeriodId,
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
      <div className="rounded-2xl border border-accent/20 bg-card px-6 py-10 text-center shadow-sm/40">
        <p className="text-h3 text-foreground">No players to display</p>
        <p className="mt-1 text-meta text-muted-foreground">
          Generate a ranking period to start tracking employee performance.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full overflow-hidden rounded-2xl border border-accent/20 bg-card shadow-sm/40">
        {/* Period header */}
        <div className="flex flex-col gap-3 border-b border-border bg-background-soft px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-1">
              Active Period
            </p>
            <div className='flex gap-2 items-end'>
              <h2 className="text-h2 text-foreground">{periodLabel}</h2>
              {dateRangeSubtitle && (
                <p className="text-meta text-muted-foreground">( {dateRangeSubtitle} )</p>
              )}
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <Table className="min-w-248">
            <TableHeader>
              <TableRow className="bg-primary-gradient border-0 text-card hover:opacity-95">
                <TableHead className="w-10 whitespace-nowrap px-2 text-center text-[10px] font-bold uppercase tracking-wide text-current sm:w-16 sm:px-4 sm:text-xs">
                  Rank
                </TableHead>
                <TableHead className="min-w-32 whitespace-nowrap px-2 text-left text-[10px] font-bold uppercase tracking-wide text-current sm:min-w-56 sm:px-4 sm:text-xs">
                  Name
                </TableHead>
                <TableHead className="whitespace-nowrap px-2 text-center text-[10px] font-bold uppercase tracking-wide text-current sm:px-4 sm:text-xs">
                  <span className="sm:hidden">Tasks Completed</span>
                  <span className="hidden sm:inline">Total Completed Tasks</span>
                </TableHead>
                <TableHead className="whitespace-nowrap px-2 text-center text-[10px] font-bold uppercase tracking-wide text-current sm:px-4 sm:text-xs">
                  <span className="sm:hidden">Task Pts</span>
                  <span className="hidden sm:inline">Task Points</span>
                </TableHead>
                <TableHead className="whitespace-nowrap px-2 text-center text-[10px] font-bold uppercase tracking-wide text-current sm:px-4 sm:text-xs">
                  <span className="sm:hidden">Badge Pts</span>
                  <span className="hidden sm:inline">Badge Points</span>
                </TableHead>
                <TableHead className="whitespace-nowrap px-2 text-center text-[10px] font-bold uppercase tracking-wide text-current sm:px-4 sm:text-xs">
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5">
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
                            Performance Score = (Task Points × Completed Tasks) + Badge Points
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
                      <TableCell className="px-2 py-2.5 text-center sm:px-4 sm:py-3.5">
                        <div className="mx-auto h-6 w-8 animate-pulse rounded bg-gray-300" />
                      </TableCell>
                      <TableCell className="px-2 py-2.5 sm:px-4 sm:py-3.5">
                        <div className="flex items-center justify-start gap-2 sm:gap-2.5">
                          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-300 sm:h-10 sm:w-10" />
                          <div className="h-4 w-32 animate-pulse rounded bg-gray-300 sm:h-4.5 sm:w-44" />
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2.5 pr-2 text-center sm:py-3.5 sm:pr-4">
                        <div className="mx-auto h-4 w-14 animate-pulse rounded bg-gray-300" />
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2.5 pr-2 text-center sm:py-3.5 sm:pr-4">
                        <div className="mx-auto h-4 w-14 animate-pulse rounded bg-gray-300" />
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2.5 pr-2 text-center sm:py-3.5 sm:pr-4">
                        <div className="mx-auto h-4 w-14 animate-pulse rounded bg-gray-300" />
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2.5 pr-3 text-center sm:py-3.5 sm:pr-5">
                        <div className="mx-auto h-5 w-20 animate-pulse rounded bg-gray-300" />
                      </TableCell>
                    </TableRow>
                  ))
                : paginatedPlayers.map((player) => (
                    <TableRow
                      key={player.id}
                      className="bg-card transition-colors hover:bg-accent-secondary/25"
                    >
                      <TableCell className="px-2 py-2.5 text-center sm:px-4 sm:py-3.5">
                        <RankCell rank={player.rank} />
                      </TableCell>
                      <TableCell className="px-2 py-2.5 sm:px-4 sm:py-3.5">
                        <div className="flex items-center justify-start gap-2 sm:gap-2.5">
                          <Avatar className="h-8 w-8 border-2 border-background sm:h-10 sm:w-10">
                            <AvatarImage src={player.image ?? undefined} alt={player.name} />
                            <AvatarFallback className="bg-primary-gradient text-xs font-semibold text-card sm:text-sm">
                              {player.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="line-clamp-1 text-xs font-semibold text-foreground sm:text-sm">
                            {player.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2.5 pr-2 text-center sm:py-3.5 sm:pr-4">
                        <span className="text-xs font-semibold text-foreground sm:text-sm">
                          {player.totalCompletedTasks.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2.5 pr-2 text-center sm:py-3.5 sm:pr-4">
                        <span className="text-xs font-semibold text-foreground sm:text-sm">
                          {player.taskPoints.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2.5 pr-2 text-center sm:py-3.5 sm:pr-4">
                        <span className="text-xs font-semibold text-foreground sm:text-sm">
                          {player.badgePoints.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2.5 pr-3 text-center sm:py-3.5 sm:pr-5">
                        <span className="text-xs font-semibold text-primary sm:text-sm">
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
                  <TableCell className="px-2 py-2.5 text-center sm:px-4 sm:py-3.5">
                    <span className="invisible text-xl font-semibold sm:text-2xl">0</span>
                  </TableCell>
                  <TableCell className="px-2 py-2.5 sm:px-4 sm:py-3.5">
                    <div className="flex items-center justify-start gap-2 sm:gap-2.5">
                      <div className="invisible h-8 w-8 sm:h-10 sm:w-10" />
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2.5 pr-2 text-center sm:py-3.5 sm:pr-4">
                    <span className="invisible text-xs font-semibold sm:text-sm">0</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2.5 pr-2 text-center sm:py-3.5 sm:pr-4">
                    <span className="invisible text-xs font-semibold sm:text-sm">0</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2.5 pr-2 text-center sm:py-3.5 sm:pr-4">
                    <span className="invisible text-xs font-semibold sm:text-sm">0</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2.5 pr-3 text-center sm:py-3.5 sm:pr-5">
                    <span className="invisible text-xs font-semibold sm:text-sm">0</span>
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
