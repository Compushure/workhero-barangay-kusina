import { getISOWeek, getISOWeekYear } from 'date-fns';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { checkRankingExists, getAllRankingPeriods } from '@/actions/hr/leaderboard';
import { LeaderboardContent } from '@/components/hr/leaderboard/leaderboard-content';
import { LeaderboardViewToggle } from '@/components/hr/leaderboard/leaderboard-view-toggle';
import { PastRanksList } from '@/components/hr/leaderboard/past-ranks-list';
import { PeriodSelector } from '@/components/hr/leaderboard/period-selector';
import { getISOWeeksInYear } from '@/lib/utils/time-period-utils';
import type { RankLogPeriodType } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WorkHero | Leaderboard',
  icons: {
    icon: '/assets/website-logo.svg',
    shortcut: '/assets/website-logo.svg',
    apple: '/assets/website-logo.svg',
  },
};

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

function toPositiveInt(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getPreviousWeek() {
  const now = new Date();
  const nowWeek = getISOWeek(now);
  const nowYear = getISOWeekYear(now);

  if (nowWeek <= 1) {
    const previousYear = nowYear - 1;
    return { year: previousYear, week: getISOWeeksInYear(previousYear) };
  }

  return { year: nowYear, week: nowWeek - 1 };
}

function getPreviousMonth() {
  const now = new Date();
  const month = now.getMonth() + 1;

  if (month <= 1) {
    return { year: now.getFullYear() - 1, month: 12 };
  }

  return { year: now.getFullYear(), month: month - 1 };
}

function getPreviousYear() {
  return new Date().getFullYear() - 1;
}

function parsePeriodType(value: string | undefined): RankLogPeriodType {
  if (value === 'monthly' || value === 'yearly') return value;
  return 'weekly';
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const periodType = parsePeriodType(resolvedParams.type);

  const previousWeek = getPreviousWeek();
  const previousMonth = getPreviousMonth();
  const previousYear = getPreviousYear();

  const selectedYear = toPositiveInt(resolvedParams.year);
  const selectedWeek = toPositiveInt(resolvedParams.week);
  const selectedMonth = toPositiveInt(resolvedParams.month);

  const year =
    selectedYear ??
    (periodType === 'weekly'
      ? previousWeek.year
      : periodType === 'monthly'
        ? previousMonth.year
        : previousYear);

  const week = selectedWeek ?? previousWeek.week;
  const month = selectedMonth ?? previousMonth.month;

  const currentView = resolvedParams.view === 'past' ? 'past' : 'generate';
  // Default to showing rankings unless explicitly set to false.
  // This ensures navigating back to the page (without params) still renders the table.
  const show = resolvedParams.show !== '0' && resolvedParams.show !== 'false';

  // When view=past AND a specific year is in the URL, the user clicked "View Ranking"
  // from the past-ranks list — show the table, not the list.
  const isViewingSpecificPastRank = currentView === 'past' && selectedYear !== null;

  const currentPeriodRankingExistsResult = await checkRankingExists(
    periodType,
    year,
    periodType === 'monthly' ? month : undefined,
    periodType === 'weekly' ? week : undefined
  );

  const currentPeriodRankingExists =
    currentPeriodRankingExistsResult.success && !!currentPeriodRankingExistsResult.data;

  // Only fetch the list when actually showing the past-ranks list, not the detail view.
  const initialPastRanksData =
    currentView === 'past' && !isViewingSpecificPastRank ? await getAllRankingPeriods() : null;

  return (
    <div className="min-h-screen overflow-x-hidden bg-white px-3 py-3 sm:px-4 sm:py-4">
      <div className="mx-auto mt-2 w-full max-w-7xl sm:mt-4">
        <div className="mb-2 sm:mb-3">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Leaderboard
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Generate rankings by period and control employee visibility.
              </p>
            </div>
            <LeaderboardViewToggle currentView={currentView} />
          </div>

          {currentView === 'generate' ? (
            <PeriodSelector
              currentType={periodType}
              currentYear={year}
              currentWeek={week}
              currentMonth={month}
              currentPeriodRankingExists={currentPeriodRankingExists}
            />
          ) : null}

          {isViewingSpecificPastRank ? (
            <Link
              href="/hr/leaderboard?view=past"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Past Rankings
            </Link>
          ) : null}
        </div>

        {currentView === 'past' && !isViewingSpecificPastRank ? (
          <PastRanksList initialData={initialPastRanksData} />
        ) : (
          <LeaderboardContent
            periodType={periodType}
            year={year}
            week={week}
            month={month}
            show={show}
          />
        )}
      </div>
    </div>
  );
}
