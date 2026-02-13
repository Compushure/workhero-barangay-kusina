import LeaderboardCard from '@/components/hr/leaderboard/leaderboard-top-one-card';
import LeaderboardList from '@/components/hr/leaderboard/leaderboard-list';
import LeaderboardFilters from '@/components/hr/leaderboard/leaderboard-filters';
import { getTopPlayers } from '@/actions/hr/leaderboard';
import { Suspense } from 'react';
import { MarketSuspense } from '@/components/shared/market-suspense';

interface LeaderboardPageProps {
  searchParams: Promise<{ period?: string }>;
}

/**
 * Get description text based on time period filter
 */
function getPeriodDescription(period?: string): string {
  switch (period) {
    case 'current':
      return 'All-time cumulative Top 10 performers.';
    case 'weekly':
      return 'Snapshot of Top 10 as of end of last week.';
    case 'monthly':
      return 'Snapshot of Top 10 as of end of last month.';
    case 'yearly':
      return 'Snapshot of Top 10 as of end of last year.';
    default:
      return 'All-time cumulative Top 10 performers.';
  }
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const params = await searchParams;
  const period = params.period as 'current' | 'weekly' | 'monthly' | 'yearly' | undefined;

  const result = await getTopPlayers(period);
  const description = getPeriodDescription(period);

  // Handle error or empty data
  if (result.error || !result.data || result.data.length === 0) {
    return (
      <Suspense fallback={<MarketSuspense label="Loading leaderboard..." />}>
        <div className="p-8 bg-[#F3F3F3] min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-6 sm:mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#6D1616]">Leaderboard Slide</h1>
                <p className="text-gray-500 text-sm sm:text-base">{description}</p>
              </div>
              <LeaderboardFilters currentPeriod={period} />
            </div>
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-500 text-lg">
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
      <div className="p-8 bg-[#F3F3F3] min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#6D1616]">Leaderboard Slide</h1>
              <p className="text-gray-500 text-sm sm:text-base">{description}</p>
            </div>
            <LeaderboardFilters currentPeriod={period} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-start">
            {/* 1st Place Highlight */}
            <div className="lg:col-span-3 flex justify-center">
              <LeaderboardCard player={topPlayer} />
            </div>

            {/* List for 2nd - 10th: no max-height or overflow so all 9 ranks are visible without a scrollbar */}
            <div className="lg:col-span-9 min-w-0 lg:ml-16 overflow-visible min-h-0">
              <LeaderboardList players={others} />
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
