import { Suspense } from 'react';
import { getISOWeek } from 'date-fns';
import { LeaderboardContent } from '@/components/hr/leaderboard/leaderboard-content';
import { PeriodSelector } from '@/components/hr/leaderboard/period-selector';
import LeaderboardTableSkeleton from '@/components/hr/leaderboard/leaderboard-table-skeleton';
import { getLatestWeeklyPeriod } from '@/actions/hr/leaderboard';
import type { RankLogPeriodType } from '@/types';

interface LeaderboardPageProps {
  searchParams: Promise<{ type?: string; year?: string; week?: string; month?: string; show?: string }>;
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const params = await searchParams;

  const periodType: RankLogPeriodType =
    params.type && ['weekly', 'monthly', 'yearly'].includes(params.type)
      ? (params.type as RankLogPeriodType)
      : 'weekly';

  const now = new Date();
  const defaultYear = now.getFullYear();
  const defaultWeek = Math.max(1, getISOWeek(now) - 1);
  const defaultMonth = Math.max(1, now.getMonth()); // previous month (0-based → 1-based)

  // When no period is selected (show≠1), default to the latest generated weekly ranking
  const hasExplicitShow = params.show === '1';
  const latestResult = !hasExplicitShow ? await getLatestWeeklyPeriod() : null;
  const latestWeekly =
    latestResult?.success && latestResult.data ? latestResult.data : null;

  const year = params.year
    ? Math.max(2025, Number(params.year))
    : latestWeekly?.year ?? defaultYear;
  const week = params.week ? Number(params.week) : latestWeekly?.week ?? defaultWeek;
  const month = params.month ? Number(params.month) : defaultMonth;
  const show = hasExplicitShow || !!latestWeekly;

  return (
    <div className="h-screen p-4  bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Leaderboards
              </h1>
              <p className="text-sm text-muted-foreground">
              View rankings by week, month, and year.
              </p>
            </div>
          </div>
          <PeriodSelector
            currentType={periodType}
            currentYear={year}
            currentWeek={week}
            currentMonth={month}
          />
        </div>

        <Suspense fallback={<LeaderboardTableSkeleton />}>
          <LeaderboardContent
            periodType={periodType}
            year={year}
            week={week}
            month={month}
            show={show}
          />
        </Suspense>
      </div>
    </div>
  );
}
