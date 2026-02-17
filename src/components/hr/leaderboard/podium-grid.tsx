import LeaderboardPodiumCard from './leaderboard-podium-card';
import type { LeaderboardPlayer } from '@/types';

interface PodiumGridProps {
  top3: Array<LeaderboardPlayer & { rank: number }>;
}

/**
 * PodiumGrid: Displays the top 3 players in podium style (2nd, 1st, 3rd)
 */
export default function PodiumGrid({ top3 }: PodiumGridProps) {
  if (top3.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 mt-12 sm:mt-16 items-end justify-items-center">
      {/* 2nd Place - Left */}
      {top3[1] && <LeaderboardPodiumCard key={top3[1].id} player={top3[1]} />}

      {/* 1st Place - Center */}
      {top3[0] && <LeaderboardPodiumCard key={top3[0].id} player={top3[0]} />}

      {/* 3rd Place - Right */}
      {top3[2] && <LeaderboardPodiumCard key={top3[2].id} player={top3[2]} />}
    </div>
  );
}
