import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Player {
  name: string;
  points: number;
  image?: string;
}

/**
 * LeaderboardCard: Displays the top-ranked player in a large, 
 * central feature card.
 */
export default function LeaderboardCard({ player }: { player: Player }) {
  return (
    <div className="w-full max-w-sm bg-[#F9F3E9] rounded-3xl overflow-hidden shadow-sm border border-orange-100">
      {/* Rank Badge */}
      <div className="bg-[#E9C496] py-2 text-center font-bold text-[#6D1616] mt-4 mx-auto w-32 rounded-lg">
        1st Rank
      </div>

      <div className="p-8 flex flex-col items-center text-center">
        {/* Profile Circle */}
        <div className="relative w-40 h-40 rounded-full border-8 border-[#E9C496] flex items-center justify-center bg-white mb-6">
          <Avatar className="w-full h-full">
            <AvatarImage src={player.image} />
            <AvatarFallback className="bg-transparent text-[#6D1616]">
              {/* Placeholder Icon from image */}
              <span className="text-4xl"> </span>
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Stars and Name */}
        <div className="mb-8">
          <div className="flex justify-center gap-1 text-[#6D1616] text-xl mb-1">
            <span>☆</span><span className="text-2xl">☆</span><span>☆</span>
          </div>
          <h2 className="text-4xl font-bold text-[#6D1616]">{player.name}</h2>
        </div>

        {/* Points Section */}
        <div className="w-full border-t border-orange-200 pt-4">
          <div className="text-5xl font-bold text-[#6D1616]">{player.points}</div>
          <p className="text-[#6D1616] font-medium mt-1">Fiesta Points</p>
        </div>
      </div>
    </div>
  );
}