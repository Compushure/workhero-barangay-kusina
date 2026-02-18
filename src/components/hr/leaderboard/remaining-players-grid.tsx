import LeaderboardCompactCard from './leaderboard-compact-card';
import type { LeaderboardPlayer } from '@/types';
import { cn } from '@/lib/utils';

interface RemainingPlayersGridProps {
  players: Array<LeaderboardPlayer & { rank: number }>;
}

/**
 * RemainingPlayersGrid: Displays players ranked 4-10 in a responsive grid
 * Uses conditional layout based on player count for better visual balance
 */
export default function RemainingPlayersGrid({ players }: RemainingPlayersGridProps) {
  if (players.length === 0) return null;

  // Adjust grid columns based on player count for better visual balance
  const gridColsClass = cn(
    'grid gap-4 justify-items-center mt-8 sm:mt-10',
    players.length === 1 && 'grid-cols-1 justify-center',
    players.length === 2 && 'grid-cols-2 max-w-md mx-auto',
    players.length === 3 && 'grid-cols-2 sm:grid-cols-3 max-w-2xl mx-auto',
    players.length >= 4 && players.length <= 6 && 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 max-w-4xl mx-auto',
    players.length === 7 && 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7'
  );

  return (
    <div className={gridColsClass}>
      {players.map((player) => (
        <LeaderboardCompactCard key={player.id} player={player} />
      ))}
    </div>
  );
}
