'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Player {
  name: string;
  performanceScore: number;
  image?: string | null;
  id?: string;
  rank?: number;
}

/**
 * LeaderboardCard: Displays the top-ranked player in a large,
 * central feature card.
 */
export default function LeaderboardCard({ player }: { player: Player }) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative w-full max-w-md mx-auto sm:mx-0 bg-card rounded-2xl sm:rounded-3xl overflow-visible shadow-sm border border-accent">
      {/* Rank Badge - overlaps top of card like a ribbon/tab */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -top-3 z-10 w-32 sm:w-36 lg:w-40 py-2.5 sm:py-3 bg-[#EBCBA8] text-center font-bold text-[#6F3F3A] rounded-t-lg rounded-b-xl text-base sm:text-lg"
        style={{ boxShadow: '0 4px 6px -1px rgba(107, 63, 58, 0.15)' }}
      >
        1st Rank
      </div>

      <div className="pt-10 sm:pt-12 lg:pt-14 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Profile Circle */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full border-4 sm:border-6 lg:border-8 border-[#E9C496] flex items-center justify-center bg-white mb-4 sm:mb-6 lg:mb-8">
          <Avatar className="w-full h-full">
            <AvatarImage src={player.image ?? undefined} />
            <AvatarFallback className="bg-transparent text-[#6D1616] text-3xl sm:text-4xl lg:text-5xl font-bold">
              {getInitials(player.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Stars and Name */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex justify-center gap-1 text-[#6D1616] text-lg sm:text-xl lg:text-2xl mb-1">
            <span>☆</span>
            <span className="text-xl sm:text-2xl lg:text-3xl">☆</span>
            <span>☆</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#6D1616] wrap-break-word px-1">
            {player.name}
          </h2>
        </div>

        {/* Performance Score Section */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full border-t border-orange-200 pt-3 sm:pt-4 lg:pt-5 cursor-help">
              <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#6D1616]">
                {player.performanceScore}
              </div>
              <p className="text-[#6D1616] font-medium mt-1 text-sm sm:text-base">Performance Score</p>
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
