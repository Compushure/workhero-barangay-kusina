import LeaderboardPodiumCard from '@/components/hr/leaderboard/leaderboard-podium-card';
import LeaderboardCompactCard from '@/components/hr/leaderboard/leaderboard-compact-card';
import { getTopPlayers } from '@/actions/hr/leaderboard';
import { Suspense } from 'react';
import { MarketSuspense } from '@/components/shared/market-suspense';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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

/**
 * Get display label for time period
 */
function getPeriodLabel(period?: string): string {
  switch (period) {
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    case 'yearly':
      return 'Yearly';
    case 'current':
    default:
      return 'Current';
  }
}

/**
 * Get previous/next period for navigation
 */
function getAdjacentPeriod(currentPeriod: string = 'current', direction: 'prev' | 'next'): string {
  const periods = ['current', 'weekly', 'monthly', 'yearly'];
  const currentIndex = periods.indexOf(currentPeriod);
  
  if (direction === 'prev') {
    return periods[currentIndex > 0 ? currentIndex - 1 : periods.length - 1];
  } else {
    return periods[currentIndex < periods.length - 1 ? currentIndex + 1 : 0];
  }
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const params = await searchParams;
  const period = params.period as 'current' | 'weekly' | 'monthly' | 'yearly' | undefined;

  const result = await getTopPlayers(period);
  const description = getPeriodDescription(period);
  const periodLabel = getPeriodLabel(period);
  const prevPeriod = getAdjacentPeriod(period, 'prev');
  const nextPeriod = getAdjacentPeriod(period, 'next');

  // Handle error or empty data
  if (result.error || !result.data || result.data.length === 0) {
    return (
      <Suspense fallback={<MarketSuspense label="Loading leaderboard..." />}>
        <div className="p-4 sm:p-8 bg-[#F3F3F3] min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Hall of Fame Header */}
            <div className="flex flex-col items-center mb-6 sm:mb-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-2">
                <span className="text-2xl sm:text-3xl">🏆</span>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#6D1616]">Hall of Fame</h1>
                <span className="text-2xl sm:text-3xl">🏆</span>
              </div>
              
              {/* Period Selector with Arrows */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Link 
                  href={`/hr/leaderboard?period=${prevPeriod}`}
                  className="p-1.5 sm:p-2 hover:bg-[#F9F3E9] rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#6D1616]" />
                </Link>
                <span className="text-lg sm:text-xl font-semibold text-[#6D1616] min-w-25 sm:min-w-30 text-center">
                  {periodLabel}
                </span>
                <Link 
                  href={`/hr/leaderboard?period=${nextPeriod}`}
                  className="p-1.5 sm:p-2 hover:bg-[#F9F3E9] rounded-full transition-colors"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#6D1616]" />
                </Link>
              </div>
              
              <p className="text-gray-500 text-sm sm:text-base text-center mt-2">{description}</p>
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

  const top3 = playersWithRank.slice(0, 3);
  const remaining = playersWithRank.slice(3);

  return (
    <Suspense fallback={<MarketSuspense label="Loading leaderboard..." />}>
      <div className="p-4 sm:p-8 bg-[#F3F3F3] min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Hall of Fame Header */}
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-2">
              <span className="text-2xl sm:text-3xl">🏆</span>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#6D1616]">Hall of Fame</h1>
              <span className="text-2xl sm:text-3xl">🏆</span>
            </div>
            
            {/* Period Selector with Arrows */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link 
                href={`/hr/leaderboard?period=${prevPeriod}`}
                className="p-1.5 sm:p-2 hover:bg-[#F9F3E9] rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#6D1616]" />
              </Link>
              <span className="text-lg sm:text-xl font-semibold text-[#6D1616] min-w-25 sm:min-w-30 text-center">
                {periodLabel}
              </span>
              <Link 
                href={`/hr/leaderboard?period=${nextPeriod}`}
                className="p-1.5 sm:p-2 hover:bg-[#F9F3E9] rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#6D1616]" />
              </Link>
            </div>
            
            <p className="text-gray-500 text-sm sm:text-base text-center mt-2">{description}</p>
          </div>

          {/* Top 3 Podium Row - Ordered as 2nd, 1st, 3rd */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 mt-12 sm:mt-16 items-end justify-items-center">
              {/* 2nd Place - Left */}
              {top3[1] && <LeaderboardPodiumCard key={top3[1].id} player={top3[1]} />}
              
              {/* 1st Place - Center */}
              {top3[0] && <LeaderboardPodiumCard key={top3[0].id} player={top3[0]} />}
              
              {/* 3rd Place - Right */}
              {top3[2] && <LeaderboardPodiumCard key={top3[2].id} player={top3[2]} />}
            </div>
          )}

          {/* Remaining Players - Grid Layout */}
          {remaining.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 justify-items-center mt-8 sm:mt-10">
              {remaining.map((player) => (
                <LeaderboardCompactCard key={player.id} player={player} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
}
