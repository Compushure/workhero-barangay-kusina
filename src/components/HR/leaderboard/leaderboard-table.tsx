import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { LeaderboardPlayer } from '@/types';

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
  if (players.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-300 p-8 text-center max-w-6xl mx-auto">
        <p className="text-[#6D1616]">No players to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-300 shadow-md overflow-hidden max-w-6xl mx-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#6D1616] border-[#6D1616] hover:bg-[#5a1414]">
            <TableHead className="font-bold text-white w-20 text-lg pl-6 pr-8">RANK</TableHead>
            <TableHead className="font-bold text-white text-lg">NAME</TableHead>
            <TableHead className="font-bold text-white text-right text-lg pr-6">
              PERFORMANCE SCORE
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow
              key={player.id}
              className="bg-[#FBF4E8] border-gray-300 hover:bg-white transition-colors"
            >
              <TableCell className="pl-6 pr-8">
                <span className="font-bold text-[#6D1616] text-xl">
                  {getOrdinalSuffix(player.rank)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-gray-300">
                    <AvatarImage src={player.image ?? undefined} alt={player.name} />
                    <AvatarFallback className="bg-gray-200 text-[#6D1616] font-semibold text-base">
                      {player.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-[#6D1616] text-xl">{player.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right pr-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="font-semibold text-[#6D1616] text-2xl cursor-help">
                        {player.performanceScore.toLocaleString()}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        Performance Score = Total Points Earned × Completed Tasks
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
