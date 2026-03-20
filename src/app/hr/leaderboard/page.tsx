import { Suspense } from 'react';
import type { Metadata } from 'next';
import LeaderboardLoading from './loading';
import { LeaderboardPageContent } from '@/components/hr/leaderboard/leaderboard-page';

type SearchParams = {
  type?: string;
  year?: string;
  week?: string;
  month?: string;
  show?: string;
  view?: string;
};

interface LeaderboardPageProps {
  searchParams?: Promise<SearchParams>;
}

export const metadata: Metadata = {
  title: 'WorkHero | Leaderboard',
  icons: {
    icon: '/assets/website-logo.svg',
    shortcut: '/assets/website-logo.svg',
    apple: '/assets/website-logo.svg',
  },
};

export default function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  return (
    <Suspense fallback={<LeaderboardLoading />}>
      <LeaderboardPageContent searchParams={searchParams} />
    </Suspense>
  );
}
