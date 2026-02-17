'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Player {
  name: string;
  performanceScore: number;
  image?: string | null;
  id?: string;
  rank: number;
}

/**
 * LeaderboardPodiumCard: Displays top 3 ranked players in podium-style cards.
 * Position #1 is visually larger than positions #2 and #3.
 */
export default function LeaderboardPodiumCard({ player }: { player: Player }) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankLabel = (rank: number) => {
    if (rank === 1) return '1st Rank';
    if (rank === 2) return '2nd Rank';
    if (rank === 3) return '3rd Rank';
    return `${rank}th Rank`;
  };

  // Position #1 is larger
  const isFirstPlace = player.rank === 1;

  return (
    <div
      className={cn(
        'relative w-full bg-card rounded-2xl overflow-visible shadow-sm border border-accent',
        'transition-all duration-300',
        isFirstPlace ? 'sm:scale-110 sm:-translate-y-4 z-10' : ''
      )}
    >
      {/* Rank Badge - overlaps top of card */}
      <div
        className={cn(
          'absolute left-1/2 -translate-x-1/2 -top-3 z-10 py-2 bg-[#EBCBA8] text-center font-bold text-[#6F3F3A] rounded-t-lg rounded-b-xl',
          'shadow-md',
          isFirstPlace ? 'w-32 sm:w-36 text-base sm:text-lg' : 'w-28 sm:w-32 text-sm sm:text-base'
        )}
      >
        {getRankLabel(player.rank)}
      </div>

      <div
        className={cn(
          'flex flex-col items-center text-center',
          isFirstPlace ? 'pt-10 sm:pt-12 px-4 sm:px-6 pb-4 sm:pb-6' : 'pt-8 sm:pt-10 px-3 sm:px-4 pb-3 sm:pb-4'
        )}
      >
        {/* Profile Circle */}
        <div
          className={cn(
            'relative rounded-full border-4 border-[#E9C496] flex items-center justify-center bg-white mb-3 sm:mb-4',
            isFirstPlace ? 'w-24 h-24 sm:w-32 sm:h-32 border-4 sm:border-6' : 'w-20 h-20 sm:w-24 sm:h-24 border-3'
          )}
        >
          <Avatar className="w-full h-full">
            <AvatarImage src={player.image ?? undefined} />
            <AvatarFallback
              className={cn(
                'bg-transparent text-[#6D1616] font-bold',
                isFirstPlace ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
              )}
            >
              {getInitials(player.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name */}
        <div className="mb-3 sm:mb-4 w-full">
          <h2
            className={cn(
              'font-bold text-[#6D1616] wrap-break-word px-1',
              isFirstPlace ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
            )}
          >
            {player.name}
          </h2>
        </div>

        {/* Performance Score Section */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full border-t border-orange-200 pt-2 sm:pt-3 cursor-help">
              <div
                className={cn(
                  'font-bold text-[#6D1616]',
                  isFirstPlace ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
                )}
              >
                {player.performanceScore}
              </div>
              <p className="text-[#6D1616] font-medium mt-1 text-xs sm:text-sm">Performance Score</p>
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
