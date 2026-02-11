import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

          {/* Performance Score with coin icon */}
          <div className="flex items-center gap-1 sm:gap-2 text-[#6D1616] font-bold shrink-0 text-base sm:text-lg">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
            <span>{player.performanceScore}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
