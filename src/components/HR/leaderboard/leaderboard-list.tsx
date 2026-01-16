import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Player {
  rank: number;
  name: string;
  points: number;
  image?: string;
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
    if (rank === 2) return "2nd";
    if (rank === 3) return "3rd";
    return `${rank}th`;
  };

  return (
    <div className="space-y-4">
      {players.map((player) => (
        <div
          key={player.rank}
          className="flex items-center gap-4 group"
        >
          {/* Rank Number */}
          <span className="text-lg font-bold text-primary w-12">
            {getRankSuffix(player.rank)}
          </span>

          {/* Main Row Card */}
          <div className="flex-1 flex items-center justify-between bg-[#F9F3E9] rounded-full pr-6 pl-2 py-2 shadow-sm border border-[#E9C496] transition-all hover:shadow-md">
            <div className="flex items-center gap-4">
              {/* Avatar Circle */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-[#E9C496] bg-white flex items-center justify-center overflow-hidden">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={player.image} />
                    <AvatarFallback className="bg-transparent text-[#6D1616]">
                      <svg 
                        className="w-6 h-6 text-[#6D1616]"
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                      </svg>
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              
              {/* Employee Name */}
              <span className="font-semibold text-[#6D1616]">
                {player.name}
              </span>
            </div>

            {/* Points with coin icon */}
            <div className="flex items-center gap-2 text-[#6D1616] font-bold">
              <svg 
                className="w-5 h-5 text-[#D4AF37]" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              <span>{player.points} pts</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
