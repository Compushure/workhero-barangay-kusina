import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface RowProps {
  rank: number;
  name: string;
  points: number;
}

/**
 * LeaderboardRow: A reusable horizontal list item for ranks 2 and below.
 */
export function LeaderboardRow({ rank, name, points }: RowProps) {
  return (
    <div className="flex items-center gap-4 group">
      {/* Rank Number */}
      <span className="text-lg font-bold text-gray-600 w-8">{rank}nd</span>

      {/* Main Bar */}
      <div className="flex-1 flex items-center justify-between bg-white rounded-full pr-6 pl-1 py-1 shadow-sm border border-gray-100 transition-all hover:shadow-md">
        <div className="flex items-center gap-4">
          {/* Avatar with overlapping design effect */}
          <div className="relative -ml-1">
            <div className="w-12 h-12 rounded-full border-2 border-[#E9C496] bg-[#F9F3E9] flex items-center justify-center overflow-hidden">
               <span className="text-xs"></span>
            </div>
          </div>
          <span className="font-semibold text-gray-700">{name}</span>
        </div>

        {/* Points with clock icon */}
        <div className="flex items-center gap-2 text-[#6D1616] font-bold">
          <span className="text-sm">🕒</span>
          <span>{points} pts</span>
        </div>
      </div>
    </div>
  );
}