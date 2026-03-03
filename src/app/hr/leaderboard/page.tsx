import { getTopPlayers } from '@/actions/hr/leaderboard';
import { Suspense } from 'react';
import { MarketSuspense } from '@/components/shared/market-suspense';
import HallOfFameHeader from '@/components/hr/leaderboard/hall-of-fame-header';
import PodiumGrid from '@/components/hr/leaderboard/podium-grid';
import RemainingPlayersGrid from '@/components/hr/leaderboard/remaining-players-grid';
import EmptyStateAdminCard from '@/components/hr/leaderboard/empty-state-admin-card';
import {
  PERIOD_CONFIG,
  getAdjacentPeriod,
  getEmptyMessage,
  type Period,
} from '@/lib/leaderboard-utils';

interface LeaderboardPageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const params = await searchParams;
  const period = (params.period || 'current') as Period;

  const result = await getTopPlayers(period);
  const config = PERIOD_CONFIG[period];
  const prevPeriod = getAdjacentPeriod(period, 'prev');
  const nextPeriod = getAdjacentPeriod(period, 'next');

  // Handle error or empty data
  if (result.error || !result.data || result.data.length === 0) {
    const emptyMessage = getEmptyMessage(period, result.error);

    return (
      <Suspense fallback={<MarketSuspense label="Loading leaderboard..." />}>
        <div className="p-4 sm:p-8 bg-background text-foreground min-h-screen">
          <div className="max-w-7xl mx-auto">
            <HallOfFameHeader
              periodLabel={config.label}
              period={period}
              userCount={0}
              prevPeriod={prevPeriod}
              nextPeriod={nextPeriod}
            />

            <EmptyStateAdminCard period={period} message={emptyMessage} />
          </div>
        </div>
      </Suspense>
    );
  }

  // Map database results to include rank
  const playersWithRank = result.data.map((player, index) => ({
    ...player,
    rank: index + 1,
  }));

  const top3 = playersWithRank.slice(0, 3);
  const remaining = playersWithRank.slice(3);
  const userCount = playersWithRank.length;

  return (
    <Suspense fallback={<MarketSuspense label="Loading leaderboard..." />}>
      <div className="p-4 sm:p-8 bg-background text-foreground min-h-screen">
        <div className="max-w-7xl mx-auto">
          <HallOfFameHeader
            periodLabel={config.label}
            period={period}
            userCount={userCount}
            prevPeriod={prevPeriod}
            nextPeriod={nextPeriod}
          />

          <PodiumGrid top3={top3} />
          <RemainingPlayersGrid players={remaining} />
        </div>
      </div>
    </Suspense>
  );
}
