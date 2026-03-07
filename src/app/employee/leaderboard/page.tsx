import { protectEmployeeRoute } from '@/actions/shared/auth';
import { LeaderboardPageClient } from '@/components/employee/leaderboard/leaderboard-page';

export default async function LeaderboardPage() {
  await protectEmployeeRoute();
  return <LeaderboardPageClient />;
}
