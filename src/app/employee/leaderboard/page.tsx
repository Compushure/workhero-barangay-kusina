import { protectEmployeeRoute } from '@/actions/shared/auth';
import { getLatestLeaderboardPeriods } from '@/actions/hr/leaderboard';
import { LeaderboardPageClient } from '@/components/employee/leaderboard/leaderboard-page';

export default async function LeaderboardPage() {
  await protectEmployeeRoute();

  const periodsResult = await getLatestLeaderboardPeriods();
  const latestPeriods = periodsResult.success && periodsResult.data
    ? periodsResult.data
    : { weekly: null, monthly: null, yearly: null };

  return <LeaderboardPageClient latestPeriods={latestPeriods} />;
}
