import LeaderboardCard from '@/components/hr/leaderboard/leaderboard-card';
import LeaderboardList from '@/components/hr/leaderboard/leaderboard-list';
import LeaderboardFilters from '@/components/hr/leaderboard/leaderboard-filters';

// Mock data structure
const LEADERBOARD_DATA = [
  { rank: 1, name: 'John Doe', points: 5300, image: '' },
  { rank: 2, name: 'Jane Smith', points: 5000, image: '' },
  // ... rest of the data
];

export default function LeaderboardPage() {
  const topPlayer = LEADERBOARD_DATA[0];
  const others = LEADERBOARD_DATA.slice(1);

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
