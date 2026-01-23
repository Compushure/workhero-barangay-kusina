import LeaderboardCard from '@/components/hr/leaderboard/leaderboard-card';
import LeaderboardList from '@/components/hr/leaderboard/leaderboard-list';
import LeaderboardFilters from '@/components/hr/leaderboard/leaderboard-filters';
import { getTopPlayers } from '@/actions/leaderboard/get-top-players';

export default async function LeaderboardPage() {
  const result = await getTopPlayers();

  // Handle error or empty data
  if (result.error || !result.data || result.data.length === 0) {
    return (
      <div className="p-8 bg-[#F3F3F3] min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#6D1616]">Leaderboard Slide</h1>
              <p className="text-gray-500">List of ranks for this week.</p>
            </div>
            <LeaderboardFilters />
          </div>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {result.error || 'No leaderboard data available at the moment.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Map database results to include rank
  const playersWithRank = result.data.map((player, index) => ({
    ...player,
    rank: index + 1,
  }));

  const topPlayer = playersWithRank[0];
  const others = playersWithRank.slice(1);

  return (
    <div className="p-8 bg-[#F3F3F3] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#6D1616]">Leaderboard Slide</h1>
            <p className="text-gray-500">List of ranks for this week.</p>
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
  );
}
