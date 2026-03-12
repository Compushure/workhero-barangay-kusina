import { protectEmployeeRoute } from '@/actions/shared/auth';
import { getLatestLeaderboardPeriods } from '@/actions/hr/leaderboard';
import { LeaderboardPageClient } from '@/components/employee/leaderboard/leaderboard-page';
import { Metadata } from 'next/dist/lib/metadata/types/metadata-interface';

export const metadata: Metadata = {
  title: 'WorkHero | Leaderboard',
  icons: {
    icon: '/assets/website-logo.svg',
    shortcut: '/assets/website-logo.svg',
    apple: '/assets/website-logo.svg',
  },
};

export default async function LeaderboardPage() {
  await protectEmployeeRoute();

  const periodsResult = await getLatestLeaderboardPeriods();
  const latestPeriods = periodsResult.success && periodsResult.data
    ? periodsResult.data
    : { weekly: null, monthly: null, yearly: null };

  return <LeaderboardPageClient latestPeriods={latestPeriods} />;
}
