import type { Metadata } from 'next';
import { protectEmployeeRoute } from '@/actions/shared/auth';
import { getLatestLeaderboardPeriods } from '@/actions/hr/leaderboard';
import { LeaderboardPageClient } from '@/components/employee/leaderboard/leaderboard-page';

type SearchParams = {
  view?: string;
};

export const metadata: Metadata = {
  title: 'WorkHero | Leaderboard',
  icons: {
    icon: '/assets/website-logo.svg',
    shortcut: '/assets/website-logo.svg',
    apple: '/assets/website-logo.svg',
  },
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
