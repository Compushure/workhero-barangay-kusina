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
import { Pagination } from '@/components/manager/task-verification/pagination';
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
  return <span className="font-bold text-foreground text-base">{rank}</span>;
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
      <div className="w-full rounded-xl border border-gray-300 bg-white p-6 text-center sm:p-8">
        <p className="text-foreground">No players to display</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full overflow-hidden rounded-xl border border-gray-300 bg-white shadow-md">
        {/* Period header */}
        <div className="flex flex-col gap-3 border-b border-gray-200 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div>
            <h2 className="text-lg font-bold text-foreground sm:text-xl">{periodLabel}</h2>
            {dateRangeSubtitle && (
              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{dateRangeSubtitle}</p>
            )}
          </div>
          <VisibilityToggle
            rankingPeriodId={rankingPeriodId}
            isVisible={isVisible}
            disabled={isOptimisticRanking}
          />
        </div>

        <div className="w-full overflow-x-auto">
          <Table className="min-w-150 sm:min-w-190">
            <TableHeader>
              <TableRow className="bg-[#F29F4A] border-b border-[#E8943D] hover:bg-[#F29F4A]">
                <TableHead className="w-10 whitespace-nowrap pl-1 pr-1 text-[10px] font-bold tracking-wide text-white uppercase sm:w-20 sm:pl-5 sm:pr-4 sm:text-xs">
                  Rank
                </TableHead>
                <TableHead className="min-w-36 pl-1 text-[10px] font-bold tracking-wide text-white uppercase sm:min-w-56 sm:pl-0 sm:text-xs">
                  Name
                </TableHead>
                <TableHead className="whitespace-nowrap pr-1.5 text-right text-[10px] font-bold tracking-wide text-white uppercase sm:pr-4 sm:text-xs">
                  <span className="sm:hidden">Tasks Completed</span>
                  <span className="hidden sm:inline">Total Completed Tasks</span>
                </TableHead>
                <TableHead className="whitespace-nowrap pr-1.5 text-right text-[10px] font-bold tracking-wide text-white uppercase sm:pr-4 sm:text-xs">
                  <span className="sm:hidden">Task Pts</span>
                  <span className="hidden sm:inline">Task Points</span>
                </TableHead>
                <TableHead className="whitespace-nowrap pr-1.5 text-right text-[10px] font-bold tracking-wide text-white uppercase sm:pr-4 sm:text-xs">
                  <span className="sm:hidden">Badge Pts</span>
                  <span className="hidden sm:inline">Badge Points</span>
                </TableHead>
                <TableHead className="whitespace-nowrap pr-2 text-right text-[10px] font-bold tracking-wide text-white uppercase sm:pr-5 sm:text-xs">
                  <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                    <span className="sm:hidden">Score</span>
                    <span className="hidden sm:inline">Performance Score</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info
                            className="h-3.5 w-3.5 shrink-0 cursor-help text-white/90 hover:text-white sm:size-4"
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
                    <TableRow key={`optimistic-skeleton-${index}`} className="border-0 bg-accent/5">
                      <TableCell className="py-2 pl-1 pr-1 sm:py-2.5 sm:pl-5 sm:pr-4">
                        <div className="h-5 w-6 animate-pulse rounded bg-gray-200" />
                      </TableCell>
                      <TableCell className="py-2 sm:py-2.5">
                        <div className="flex items-center gap-1 sm:gap-2.5">
                          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 sm:h-10 sm:w-10" />
                          <div className="h-4 w-28 animate-pulse rounded bg-gray-200 sm:h-5 sm:w-40" />
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2 pr-1.5 text-right sm:py-2.5 sm:pr-4">
                        <div className="ml-auto h-4 w-12 animate-pulse rounded bg-gray-200 sm:h-5" />
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2 pr-1.5 text-right sm:py-2.5 sm:pr-4">
                        <div className="ml-auto h-4 w-14 animate-pulse rounded bg-gray-200 sm:h-5" />
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2 pr-1.5 text-right sm:py-2.5 sm:pr-4">
                        <div className="ml-auto h-4 w-14 animate-pulse rounded bg-gray-200 sm:h-5" />
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2 pr-2 text-right sm:py-2.5 sm:pr-5">
                        <div className="ml-auto h-5 w-16 animate-pulse rounded bg-gray-200" />
                      </TableCell>
                    </TableRow>
                  ))
                : paginatedPlayers.map((player) => (
                    <TableRow
                      key={player.id}
                      className="bg-accent/5 border-0 transition-colors hover:bg-white"
                    >
                      <TableCell className="py-2 pl-1 pr-1 sm:py-2.5 sm:pl-5 sm:pr-4">
                        <RankCell rank={player.rank} />
                      </TableCell>
                      <TableCell className="py-2 sm:py-2.5">
                        <div className="flex items-center gap-1 sm:gap-2.5">
                          <Avatar className="h-8 w-8 border-2 border-gray-300 sm:h-10 sm:w-10">
                            <AvatarImage src={player.image ?? undefined} alt={player.name} />
                            <AvatarFallback className="bg-gray-200 text-sm font-semibold text-foreground">
                              {player.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="line-clamp-1 font-medium text-xs text-foreground sm:text-base">
                            {player.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2 pr-1.5 text-right sm:py-2.5 sm:pr-4">
                        <span className="text-xs text-foreground sm:text-base">
                          {player.totalCompletedTasks.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2 pr-1.5 text-right sm:py-2.5 sm:pr-4">
                        <span className="text-xs text-foreground sm:text-base">
                          {player.taskPoints.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2 pr-1.5 text-right sm:py-2.5 sm:pr-4">
                        <span className="text-xs text-foreground sm:text-base">
                          {player.badgePoints.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2 pr-2 text-right sm:py-2.5 sm:pr-5">
                        <span className="text-sm font-semibold text-primary sm:text-lg">
                          {player.performanceScore.toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
              {Array.from({ length: PAGE_SIZE - paginatedPlayers.length }).map((_, i) => (
                <TableRow
                  key={`placeholder-${i}`}
                  className="pointer-events-none border-0 select-none"
                >
                  <TableCell className="py-2 pl-1 pr-1 sm:py-2.5 sm:pl-5 sm:pr-4">
                    <span className="invisible text-base font-bold">0</span>
                  </TableCell>
                  <TableCell className="py-2 sm:py-2.5">
                    <div className="flex items-center gap-1 sm:gap-2.5">
                      <div className="invisible h-8 w-8 sm:h-10 sm:w-10" />
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2 pr-1.5 text-right sm:py-2.5 sm:pr-4">
                    <span className="invisible text-xs sm:text-base">0</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2 pr-1.5 text-right sm:py-2.5 sm:pr-4">
                    <span className="invisible text-xs sm:text-base">0</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2 pr-1.5 text-right sm:py-2.5 sm:pr-4">
                    <span className="invisible text-xs sm:text-base">0</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2 pr-2 text-right sm:py-2.5 sm:pr-5">
                    <span className="invisible text-sm font-semibold sm:text-lg">0</span>
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
