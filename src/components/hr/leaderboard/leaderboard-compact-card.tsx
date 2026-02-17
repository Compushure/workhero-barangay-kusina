'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Player {
  name: string;
  performanceScore: number;
  image?: string | null;
  id?: string;
  rank: number;
}

/**
 * LeaderboardCompactCard: Compact card for positions 4-10, optimized for horizontal scrolling.
 */
export default function LeaderboardCompactCard({ player }: { player: Player }) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankSuffix = (rank: number) => {
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}th`;
  };

  return (
    <div className="relative shrink-0 w-40 sm:w-48 bg-card rounded-2xl overflow-visible shadow-sm border border-accent transition-all hover:shadow-md">
      {/* Rank Badge - overlaps top of card */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -top-2.5 z-10 w-20 sm:w-24 py-1.5 sm:py-2 bg-[#EBCBA8] text-center font-bold text-[#6F3F3A] rounded-t-lg rounded-b-xl text-xs sm:text-sm shadow-md"
      >
        {getRankSuffix(player.rank)}
      </div>

      <div className="pt-8 sm:pt-9 px-3 sm:px-4 pb-3 sm:pb-4 flex flex-col items-center text-center">
        {/* Profile Circle */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-3 border-[#E9C496] flex items-center justify-center bg-white mb-2 sm:mb-3">
          <Avatar className="w-full h-full">
            <AvatarImage src={player.image ?? undefined} />
            <AvatarFallback className="bg-transparent text-[#6D1616] font-bold text-lg sm:text-xl">
              {getInitials(player.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name - truncate if too long */}
        <div className="mb-2 sm:mb-3 w-full">
          <h3 className="font-bold text-[#6D1616] text-sm sm:text-base truncate px-1" title={player.name}>
            {player.name}
          </h3>
        </div>

        {/* Performance Score Section */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full border-t border-orange-200 pt-2 cursor-help">
              <div className="text-xl sm:text-2xl font-bold text-[#6D1616]">{player.performanceScore}</div>
              <p className="text-[#6D1616] font-medium text-xs">Performance Score</p>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8} className="max-w-xs">
            Performance Score = number of approved tasks × total points earned (lifetime).
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
