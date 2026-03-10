import { getISOWeek, getISOWeekYear } from 'date-fns';
import { LeaderboardContent } from '@/components/hr/leaderboard/leaderboard-content';
import { PeriodSelector } from '@/components/hr/leaderboard/period-selector';
import { LeaderboardViewToggle } from '@/components/hr/leaderboard/leaderboard-view-toggle';
import { PastRanksList } from '@/components/hr/leaderboard/past-ranks-list';
import {
  getLatestWeeklyPeriod,
  checkRankingExists,
  getAllRankingPeriods,
} from '@/actions/hr/leaderboard';
import { getISOWeeksInYear } from '@/lib/utils/time-period-utils';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { RankLogPeriodType } from '@/types';

function getPreviousWeek(): { year: number; week: number } {
  const now = new Date();
  const nowYear = getISOWeekYear(now);
  const nowWeek = getISOWeek(now);
  if (nowWeek <= 1) {
    return { year: nowYear - 1, week: getISOWeeksInYear(nowYear - 1) };
  }
  return { year: nowYear, week: nowWeek - 1 };
}

interface LeaderboardPageProps {
  searchParams: Promise<{
    type?: string;
    year?: string;
    week?: string;
    month?: string;
    show?: string;
    view?: string;
  }>;
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const params = await searchParams;

  const periodType: RankLogPeriodType =
    params.type && ['weekly', 'monthly', 'yearly'].includes(params.type)
      ? (params.type as RankLogPeriodType)
      : 'weekly';

  const now = new Date();
  const defaultYear = now.getFullYear();
  const defaultMonth = Math.max(1, now.getMonth()); // previous month (0-based → 1-based)
  const previousWeek = getPreviousWeek();

  // When no period is selected (show≠1), default to the latest generated weekly ranking for show=1 hint only
  const hasExplicitShow = params.show === '1';
  const latestResult = !hasExplicitShow ? await getLatestWeeklyPeriod() : null;
  const latestWeekly = latestResult?.success && latestResult.data ? latestResult.data : null;

  // Weekly: always use previous week when no URL params (WEEK shows previous week only)
  const year =
    params.year != null && params.year !== ''
      ? Math.max(2025, Number(params.year))
      : periodType === 'weekly'
        ? previousWeek.year
        : (latestWeekly?.year ?? defaultYear);
  const week =
    params.week != null && params.week !== ''
      ? Number(params.week)
      : periodType === 'weekly'
        ? previousWeek.week
        : (latestWeekly?.week ?? Math.max(1, getISOWeek(now) - 1));
  const month = params.month ? Number(params.month) : defaultMonth;

  // Whether the period we're actually displaying has a ranking (for selector badge + auto-show)
  const currentExistsResult = await checkRankingExists(
    periodType,
    year,
    periodType === 'monthly' ? month : undefined,
    periodType === 'weekly' ? week : undefined
  );
  const currentPeriodRankingExists =
    currentExistsResult.success && currentExistsResult.data === true;

  // Show content when user asked for it, we have a latest weekly, or this period has a ranking (auto-show)
  const show = hasExplicitShow || !!latestWeekly || currentPeriodRankingExists;

  const currentView = params.view === 'past' ? 'past' : 'generate';
  const isPastViewing = currentView === 'past' && hasExplicitShow;

  // Fetch past ranks on the server when showing the list so the client can render immediately
  const pastRanksResult =
    currentView === 'past' && !isPastViewing ? await getAllRankingPeriods() : null;

  return (
    <div className="min-h-screen overflow-x-hidden bg-white px-3 py-3 sm:px-4 sm:py-4">
      <div className="mx-auto mt-2 w-full max-w-7xl sm:mt-4">
        <div className="mb-2 sm:mb-3">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Leaderboards
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Generate new rankings or review past results across different periods.
              </p>
            </div>
            <LeaderboardViewToggle currentView={currentView} />
          </div>

          {currentView === 'generate' && (
            <PeriodSelector
              currentType={periodType}
              currentYear={year}
              currentWeek={week}
              currentMonth={month}
              currentPeriodRankingExists={currentPeriodRankingExists}
            />
          )}
        </div>

        {currentView === 'generate' ? (
          <LeaderboardContent
            periodType={periodType}
            year={year}
            week={week}
            month={month}
            show={show}
          />
        ) : isPastViewing ? (
          <div className="flex flex-col">
            <Link
              href="/hr/leaderboard?view=past"
              className="mb-3 inline-flex min-h-10 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Past Ranks
            </Link>
            <LeaderboardContent
              periodType={periodType}
              year={year}
              week={week}
              month={month}
              show={show}
            />
          </div>
        ) : (
          <PastRanksList initialData={pastRanksResult} />
        )}
      </div>
    </div>
  );
}
