'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles } from 'lucide-react';

interface Player {
  rank: number;
  name: string;
  performanceScore: number;
  image?: string;
  id?: string;
}

interface LeaderboardListProps {
  players: Player[];
}

/**
 * LeaderboardList: Displays the ranked list of players from 2nd place onwards.
 * Each row shows rank, avatar, name, and points in a horizontal layout.
 */
export default function LeaderboardList({ players }: LeaderboardListProps) {
  const getRankSuffix = (rank: number) => {
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}th`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-3 sm:space-y-4 overflow-visible">
      {players.map((player) => (
        <div
          key={player.id || player.rank}
          className="flex items-center justify-between gap-2 bg-[#F9F3E9] rounded-full pr-4 pl-3 py-1.5 sm:pr-6 sm:pl-4 sm:py-2 lg:py-2.5 shadow-sm border border-[#E9C496] transition-all hover:shadow-md min-w-0"
        >
          {/* Rank Number - inside pill */}
          <span className="text-base sm:text-xl font-bold text-primary shrink-0 w-9 sm:w-12">
            {getRankSuffix(player.rank)}
          </span>

          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            {/* Avatar Circle */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full border-2 border-[#E9C496] bg-white flex items-center justify-center overflow-hidden">
                <Avatar className="w-full h-full">
                  <AvatarImage src={player.image} />
                  <AvatarFallback className="bg-transparent text-[#6D1616] font-semibold text-xs sm:text-sm">
                    {getInitials(player.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Employee Name */}
            <span className="font-semibold text-[#6D1616] text-base sm:text-lg truncate">
              {player.name}
            </span>
          </div>

          {/* Performance Score (sparkles icon) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 sm:gap-2 text-[#6D1616] font-bold shrink-0 text-base sm:text-lg cursor-help">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]" />
                <span>{player.performanceScore}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={8} className="max-w-xs">
              Performance Score = number of approved tasks × total points earned (lifetime).
            </TooltipContent>
          </Tooltip>
        </div>
      ))}
    </div>
  );
}
