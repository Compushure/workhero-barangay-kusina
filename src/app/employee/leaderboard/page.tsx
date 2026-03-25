import { protectEmployeeRoute } from '@/actions/shared/auth';
import { getLatestLeaderboardPeriods } from '@/actions/hr/leaderboard';
import { LeaderboardPageClient } from '@/components/employee/leaderboard/leaderboard-page';

type SearchParams = {
  view?: string;
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  await protectEmployeeRoute();

  const resolvedParams = (await searchParams) ?? {};
  const initialView = resolvedParams.view === 'history' ? 'history' : 'current';

  const periodsResult = await getLatestLeaderboardPeriods();
  const latestPeriods = periodsResult.success && periodsResult.data
    ? periodsResult.data
    : { weekly: null, monthly: null, yearly: null };

  return <LeaderboardPageClient latestPeriods={latestPeriods} initialView={initialView} />;
}
