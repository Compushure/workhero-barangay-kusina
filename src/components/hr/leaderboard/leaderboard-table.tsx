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
      <div className="w-full bg-white rounded-xl border border-gray-300 p-8 text-center">
        <p className="text-foreground">No players to display</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full bg-white rounded-xl border border-gray-300 shadow-md overflow-hidden">
        {/* Period header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-foreground">{periodLabel}</h2>
            {dateRangeSubtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{dateRangeSubtitle}</p>
            )}
          </div>
          <VisibilityToggle rankingPeriodId={rankingPeriodId} isVisible={isVisible} />
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-[#F29F4A] border-b border-[#E8943D] hover:bg-[#F29F4A]">
              <TableHead className="font-bold text-white uppercase text-xs w-20 pl-5 pr-4 tracking-wide">
                Rank
              </TableHead>
              <TableHead className="font-bold text-white uppercase text-xs tracking-wide">
                Name
              </TableHead>
              <TableHead className="font-bold text-white uppercase text-xs text-right pr-4 tracking-wide">
                Total Completed Tasks
              </TableHead>
              <TableHead className="font-bold text-white uppercase text-xs text-right pr-4 tracking-wide">
                Task Points
              </TableHead>
              <TableHead className="font-bold text-white uppercase text-xs text-right pr-4 tracking-wide">
                Badge Points
              </TableHead>
              <TableHead className="font-bold text-white uppercase text-xs text-right pr-5 tracking-wide">
                Performance Score
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPlayers.map((player) => (
              <TableRow
                key={player.id}
                className="bg-accent/5 border-0 hover:bg-white transition-colors"
              >
                <TableCell className="pl-5 pr-4 py-2.5">
                  <RankCell rank={player.rank} />
                </TableCell>
                <TableCell className="py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-10 w-10 border-2 border-gray-300">
                      <AvatarImage src={player.image ?? undefined} alt={player.name} />
                      <AvatarFallback className="bg-gray-200 text-foreground font-semibold text-sm">
                        {player.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground text-base">{player.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-4 py-2.5">
                  <span className="text-foreground text-base">
                    {player.totalCompletedTasks.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-4 py-2.5">
                  <span className="text-foreground text-base">
                    {player.taskPoints.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-4 py-2.5">
                  <span className="text-foreground text-base">
                    {player.badgePoints.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-5 py-2.5">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-semibold text-primary text-lg cursor-help">
                          {player.performanceScore.toLocaleString()}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm text-foreground">
                          Performance Score = Total Points Earned × Completed Tasks
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
            {Array.from({ length: PAGE_SIZE - paginatedPlayers.length }).map((_, i) => (
              <TableRow
                key={`placeholder-${i}`}
                className="border-0 pointer-events-none select-none"
              >
                <TableCell className="pl-5 pr-4 py-2.5">
                  <span className="invisible font-bold text-base">0</span>
                </TableCell>
                <TableCell className="py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 invisible" />
                  </div>
                </TableCell>
                <TableCell className="text-right pr-4 py-2.5">
                  <span className="invisible text-base">0</span>
                </TableCell>
                <TableCell className="text-right pr-4 py-2.5">
                  <span className="invisible text-base">0</span>
                </TableCell>
                <TableCell className="text-right pr-4 py-2.5">
                  <span className="invisible text-base">0</span>
                </TableCell>
                <TableCell className="text-right pr-5 py-2.5">
                  <span className="invisible font-semibold text-lg">0</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
