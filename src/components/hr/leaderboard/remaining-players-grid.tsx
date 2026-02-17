import LeaderboardCompactCard from './leaderboard-compact-card';
import type { LeaderboardPlayer } from '@/types';

interface RemainingPlayersGridProps {
  players: Array<LeaderboardPlayer & { rank: number }>;
}

/**
 * RemainingPlayersGrid: Displays players ranked 4-10 in a responsive grid
 */
export default function RemainingPlayersGrid({ players }: RemainingPlayersGridProps) {
  if (players.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 justify-items-center mt-8 sm:mt-10">
      {players.map((player) => (
        <LeaderboardCompactCard key={player.id} player={player} />
      ))}
    </div>
  );
}
