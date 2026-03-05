import { Suspense } from 'react';
import { getISOWeek } from 'date-fns';
import { LeaderboardSkeleton } from '@/components/hr/leaderboard/leaderboard-skeleton';
import { LeaderboardContent } from '@/components/hr/leaderboard/leaderboard-content';
import { PeriodSelector } from '@/components/hr/leaderboard/period-selector';
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

  const year = params.year ? Math.max(2025, Number(params.year)) : defaultYear;
  const week = params.week ? Number(params.week) : defaultWeek;
  const month = params.month ? Number(params.month) : defaultMonth;
  const show = params.show === '1' || (periodType === 'weekly' && !params.show);

  return (
    <div className="h-screen p-4 sm:p-8 bg-[#F3F3F3] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#6D1616]">
                Leaderboards
              </h1>
              <p className="text-sm text-[#5a2a2a]">
             Performance rankings across weekly, monthly, and yearly periods.
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

        <Suspense fallback={<LeaderboardSkeleton />}>
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
