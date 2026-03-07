'use client';

import { useCallback, useMemo, useState } from 'react';
import { useGetEmployeeTopRanksByPeriod } from '@/hooks/tanstack/queries/employeeQueries';
import type { RankLogPeriodType } from '@/types';
import type { LatestPeriods } from './period-nav';
import { PeriodNav, getLeaderboardTitle, getLatestPeriodParams } from './period-nav';
import ProfileAndLevel from '../attendance/profile-level';
import XPProgressAndPoints from '../attendance/xp-points';
import { LeaderboardEmptyState } from './leaderboard-empty-state';
import { LeaderboardPodium } from './leaderboard-podium';
import { LeaderboardShelf } from './leaderboard-shelf';
import { LeaderboardSkeleton } from './leaderboard-skeleton';

interface LeaderboardPageClientProps {
  latestPeriods: LatestPeriods;
}

export function LeaderboardPageClient({ latestPeriods }: LeaderboardPageClientProps) {
  const [periodType, setPeriodType] = useState<RankLogPeriodType>('weekly');

  const currentPeriod = useMemo(
    () => getLatestPeriodParams(periodType, latestPeriods),
    [periodType, latestPeriods]
  );
  const title = useMemo(
    () => getLeaderboardTitle(periodType, latestPeriods),
    [periodType, latestPeriods]
  );

  const { data: entries, isLoading } = useGetEmployeeTopRanksByPeriod(currentPeriod);

  const handlePeriodTypeChange = useCallback((newType: RankLogPeriodType) => {
    setPeriodType(newType);
  }, []);

  const top3 = entries?.slice(0, 3) ?? [];
  const rest = entries?.slice(3, 10) ?? [];
  const hasEntries = entries && entries.length > 0;

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

      <div className="flex flex-col items-center px-4 min-h-screen pt-20 md:pt-24">
        <header className="flex w-full max-w-4xl flex-col items-center shrink-0 min-h-48 md:min-h-56">
          <div className="mb-6">
            <PeriodNav periodType={periodType} onPeriodTypeChange={handlePeriodTypeChange} />
          </div>
          {isLoading && (
            <div
              className="h-10 md:h-14 w-64 md:w-96 rounded-lg bg-[#F4B925]/30 animate-pulse"
              aria-hidden
            />
          )}
          {!isLoading && hasEntries && (
            <h1 className="font-jersey tracking-widest text-[#F4B925] text-3xl md:text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center">
              {title}
            </h1>
          )}
        </header>

        {/* Content area: skeleton, empty state, or podium + shelf */}
        <div className="flex flex-col items-center w-full max-w-7xl flex-1 pt-4">
          {isLoading && <LeaderboardSkeleton />}
          {!isLoading && (!entries || entries.length === 0) && <LeaderboardEmptyState />}
          {!isLoading && hasEntries && (
            <div className="flex flex-col items-center gap-8 w-full">
              <LeaderboardPodium entries={top3} />
              <LeaderboardShelf entries={rest} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
