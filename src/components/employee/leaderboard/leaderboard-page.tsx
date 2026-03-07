'use client';

import { useGetEmployeeTopWeeklyRanks } from '@/hooks/tanstack/queries/employeeQueries';
import ProfileAndLevel from '../attendance/profile-level';
import XPProgressAndPoints from '../attendance/xp-points';
import { LeaderboardEmptyState } from './leaderboard-empty-state';
import { LeaderboardPodium } from './leaderboard-podium';
import { LeaderboardShelf } from './leaderboard-shelf';
import { LeaderboardSkeleton } from './leaderboard-skeleton';

export function LeaderboardPageClient() {
  const { data: entries, isLoading } = useGetEmployeeTopWeeklyRanks();

  const top3 = entries?.slice(0, 3) ?? [];
  const rest = entries?.slice(3, 10) ?? [];

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center flex flex-col font-jersey tracking-widest"
      style={{ backgroundImage: 'url(/assets/leaderboard-bg.png)' }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      {/* HUD — top left */}
      <div className="absolute top-4 left-4 flex flex-row items-center gap-6">
        <ProfileAndLevel />
        <XPProgressAndPoints />
      </div>

      {/* Page content */}
      <div className="flex flex-col items-center justify-center px-4 min-h-screen -mt-16">
        {/* Title: skeleton when loading, real title when data is ready */}
        {isLoading && (
          <div
            className="h-10 md:h-14 w-64 md:w-96 mx-auto mb-25 rounded-lg bg-[#F4B925]/30 animate-pulse"
            aria-hidden
          />
        )}
        {!isLoading && entries && entries.length > 0 && (
          <h1 className="font-jersey tracking-widest text-[#F4B925] text-3xl md:text-6xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-25 text-center">
            Top Kusineros of the Week
          </h1>
        )}

        {isLoading && <LeaderboardSkeleton />}

        {!isLoading && (!entries || entries.length === 0) && <LeaderboardEmptyState />}

        {!isLoading && entries && entries.length > 0 && (
          <div className="flex flex-col items-center gap-8 w-full max-w-7xl">
            <LeaderboardPodium entries={top3} />
            <LeaderboardShelf entries={rest} />
          </div>
        )}
      </div>
    </div>
  );
}
