'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Trophy } from 'lucide-react';
import type { UserBadge } from '@/actions/employee/badges';

interface Player {
  name: string;
  performanceScore: number;
  image?: string | null;
  id?: string;
  rank: number;
  badges: UserBadge[];
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

  // Show latest 4 badges + count indicator
  const maxBadgesToShow = 4;
  const visibleBadges = player.badges?.slice(0, maxBadgesToShow) || [];
  const remainingBadges = Math.max(0, (player.badges?.length || 0) - maxBadgesToShow);

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

        {/* Badges Section */}
        {player.badges && player.badges.length > 0 && (
          <div className="mb-2 w-full">
            <div className="flex gap-1 justify-center flex-wrap">
              {visibleBadges.map((badge) => (
                <Tooltip key={badge.userbadge_id}>
                  <TooltipTrigger asChild>
                    <div className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full overflow-hidden border-2 border-[#730202]/20 hover:border-[#730202] transition-colors cursor-help">
                      {badge.img_link ? (
                        <img
                          src={badge.img_link}
                          alt={badge.badge_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-[#730202]/10 flex items-center justify-center">
                          <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#730202]" />
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={8} className="bg-black/80 text-white">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-xs">{badge.badge_name}</p>
                      <p className="text-gray-300 text-[10px]">
                        {new Date(badge.date_acquired).toLocaleDateString()}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
              
              {/* "+X more" indicator */}
              {remainingBadges > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full overflow-hidden border-2 border-[#730202]/40 bg-[#730202]/5 flex items-center justify-center cursor-help">
                      <span className="text-[#730202] font-bold text-[10px]">
                        +{remainingBadges}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={8} className="bg-black/80 text-white">
                    <p className="text-xs">{remainingBadges} more badge{remainingBadges > 1 ? 's' : ''}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        )}

        {/* Performance Score Section */}
        <div className="w-full border-t border-orange-200 pt-2">
          <div className="text-xl sm:text-2xl font-bold text-[#6D1616]">{player.performanceScore}</div>
          <p className="text-[#6D1616] font-medium text-xs">Performance Score</p>
        </div>
      </div>
    </div>
  );
}
