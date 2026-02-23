import LeaderboardPodiumCard from './leaderboard-podium-card';
import type { LeaderboardPlayer } from '@/types';
import { cn } from '@/lib/utils';

interface PodiumGridProps {
  top3: Array<LeaderboardPlayer & { rank: number }>;
}

/**
 * PodiumGrid: Displays the top 3 players in podium style (2nd, 1st, 3rd)
 * Handles edge cases for 1 or 2 players with centered layout
 */
export default function PodiumGrid({ top3 }: PodiumGridProps) {
  if (top3.length === 0) return null;

  // Adjust layout based on number of top players
  const gridClass = cn(
    'grid gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 mt-12 sm:mt-16 items-end justify-items-center',
    top3.length === 1 && 'grid-cols-1 max-w-md mx-auto',
    top3.length === 2 && 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto',
    top3.length === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  );

  return (
    <div className={gridClass}>
      {/* 2nd Place - Left (only if exists) */}
      {top3[1] && <LeaderboardPodiumCard key={top3[1].id} player={top3[1]} />}

      {/* 1st Place - Center (always exists if top3.length > 0) */}
      {top3[0] && <LeaderboardPodiumCard key={top3[0].id} player={top3[0]} />}

      {/* 3rd Place - Right (only if exists) */}
      {top3[2] && <LeaderboardPodiumCard key={top3[2].id} player={top3[2]} />}
    </div>
  );
}
