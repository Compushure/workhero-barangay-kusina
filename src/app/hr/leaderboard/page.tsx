import LeaderboardCard from '@/components/hr/leaderboard/leaderboard-podium-card';
import LeaderboardList from '@/components/hr/leaderboard/leaderboard-list';
import LeaderboardFilters from '@/components/hr/leaderboard/leaderboard-filters';
import { getTopPlayers } from '@/actions/hr/leaderboard';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { MarketSuspense } from '@/components/shared/market-suspense';

export const metadata: Metadata = {
  title: 'WorkHero | Leaderboard',
  icons: {
    icon: '/assets/website-logo.svg',
    shortcut: '/assets/website-logo.svg',
    apple: '/assets/website-logo.svg',
  },
};

export default async function LeaderboardPage() {
  const result = await getTopPlayers();

  // Handle error or empty data
  if (result.error || !result.data || result.data.length === 0) {
    return (
      <Suspense fallback={<MarketSuspense label="Loading leaderboard..." />}>
        <div className="min-h-screen bg-background text-foreground p-8 pb-28">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Leaderboard Slide</h1>
                <p className="text-muted-foreground">List of ranks for this week.</p>
              </div>
              <LeaderboardFilters />
            </div>
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {result.error || 'No leaderboard data available at the moment.'}
              </p>
            </div>
          </div>
        </div>
      </Suspense>
    );
  }

  // Map database results to include rank
  const playersWithRank = result.data.map((player, index) => ({
    ...player,
    rank: index + 1,
    image: player.image ?? undefined,
  }));

  const topPlayer = playersWithRank[0];
  const others = playersWithRank.slice(1);

  return (
    <Suspense fallback={<MarketSuspense label="Loading leaderboard..." />}>
      <div className="min-h-screen bg-background text-foreground p-8 pb-28">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Leaderboard Slide</h1>
              <p className="text-muted-foreground">List of ranks for this week.</p>
            </div>
            <LeaderboardFilters />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* 1st Place Highlight */}
            <div className="lg:col-span-4 flex justify-center">
              <LeaderboardCard player={topPlayer} />
            </div>

            {/* Scrollable List for 2nd - 10th */}
            <div className="lg:col-span-8">
              <LeaderboardList players={others} />
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
