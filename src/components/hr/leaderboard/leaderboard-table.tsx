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
import type { LeaderboardPlayer } from '@/types';

const PAGE_SIZE = 10;

interface LeaderboardTableProps {
  players: (LeaderboardPlayer & { rank: number })[];
}

function getOrdinalSuffix(rank: number): string {
  const j = rank % 10;
  const k = rank % 100;

  if (j === 1 && k !== 11) {
    return `${rank}st`;
  }
  if (j === 2 && k !== 12) {
    return `${rank}nd`;
  }
  if (j === 3 && k !== 13) {
    return `${rank}rd`;
  }
  return `${rank}th`;
}

export default function LeaderboardTable({ players }: LeaderboardTableProps) {
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
        <Table>
          <TableHeader>
            <TableRow className="bg-primary-gradient border-0 hover:opacity-95">
              <TableHead className="font-bold text-white w-20 text-base pl-5 pr-5">RANK</TableHead>
              <TableHead className="font-bold text-white text-base">NAME</TableHead>
              <TableHead className="font-bold text-white text-right text-base pr-5">
                PERFORMANCE SCORE
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPlayers.map((player) => (
              <TableRow
                key={player.id}
                className="bg-accent/5 border-0 hover:bg-white transition-colors"
              >
                <TableCell className="pl-5 pr-5 py-2.5">
                  <span className="font-bold text-foreground text-base">
                    {getOrdinalSuffix(player.rank)}
                  </span>
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
                <TableCell className="text-right pr-5 py-2.5">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-semibold text-foreground text-lg cursor-help">
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
              <TableRow key={`placeholder-${i}`} className="border-0 pointer-events-none select-none">
                <TableCell className="pl-5 pr-5 py-2.5">
                  <span className="invisible font-bold text-base">0th</span>
                </TableCell>
                <TableCell className="py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 invisible" />
                  </div>
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
