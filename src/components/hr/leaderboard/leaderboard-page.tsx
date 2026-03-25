import { getISOWeek, getISOWeekYear } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import {
  checkRankingExists,
  getAllRankingPeriods,
  getEnrichedLeaderboardByPeriod,
} from '@/actions/hr/leaderboard';
import { LeaderboardContent } from '@/components/hr/leaderboard/leaderboard-content';
import { LeaderboardViewToggle } from '@/components/hr/leaderboard/leaderboard-view-toggle';
import { PastRanksList } from '@/components/hr/leaderboard/past-ranks-list';
import { PeriodSelector } from '@/components/hr/leaderboard/period-selector';
import { PageHeader } from '@/components/shared/page-header';
import { getISOWeeksInYear } from '@/lib/utils/time-period-utils';
import type { RankLogPeriodType } from '@/types';

const MANILA_TIMEZONE = 'Asia/Manila';

type SearchParams = {
  type?: string;
  year?: string;
  week?: string;
  month?: string;
  show?: string;
  view?: string;
  pastDefault?: string;
};

interface LeaderboardPageContentProps {
  searchParams?: Promise<SearchParams>;
}

function toPositiveInt(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getPreviousWeek() {
  const now = toZonedTime(new Date(), MANILA_TIMEZONE);
  const nowWeek = getISOWeek(now);
  const nowYear = getISOWeekYear(now);

  if (nowWeek <= 1) {
    const previousYear = nowYear - 1;
    return { year: previousYear, week: getISOWeeksInYear(previousYear) };
  }

  return { year: nowYear, week: nowWeek - 1 };
}

function getPreviousMonth() {
  const now = toZonedTime(new Date(), MANILA_TIMEZONE);
  const month = now.getMonth() + 1;

  if (month <= 1) {
    return { year: now.getFullYear() - 1, month: 12 };
  }

  return { year: now.getFullYear(), month: month - 1 };
}

function getPreviousYear() {
  return toZonedTime(new Date(), MANILA_TIMEZONE).getFullYear() - 1;
}

function parsePeriodType(value: string | undefined): RankLogPeriodType {
  if (value === 'monthly' || value === 'yearly') return value;
  return 'weekly';
}

export async function LeaderboardPageContent({ searchParams }: LeaderboardPageContentProps) {
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

  const shouldResolveDefaultPastSelection = resolvedParams.pastDefault === '1';

  const currentPeriodRankingExistsResult = await checkRankingExists(
    periodType,
    year,
    periodType === 'monthly' ? month : undefined,
    periodType === 'weekly' ? week : undefined
  );

  const currentPeriodRankingExists =
    currentPeriodRankingExistsResult.success && !!currentPeriodRankingExistsResult.data;

  const currentPeriodRankingDataResult = currentPeriodRankingExists
    ? await getEnrichedLeaderboardByPeriod(
        periodType,
        year,
        periodType === 'monthly' ? month : undefined,
        periodType === 'weekly' ? week : undefined
      )
    : null;

  const currentPeriodRankingData =
    currentPeriodRankingDataResult?.success && currentPeriodRankingDataResult.data
      ? currentPeriodRankingDataResult.data
      : null;

  // Only fetch the list when actually showing the past-ranks list, not the detail view.
  const initialPastRanksData =
    currentView === 'past' ? await getAllRankingPeriods() : null;

  return (
    <main className="w-full min-h-screen bg-background px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-4 sm:gap-6 2xl:max-w-screen-2xl">
        <div className="space-y-4 sm:space-y-5">
          <section className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
            <PageHeader
              title="Leaderboard"
              subtitle="Generate new rankings, review past ranks, and control employee visibility."
            />

            <LeaderboardViewToggle currentView={currentView} />
          </section>

        </div>

        {currentView === 'generate' ? (
          <PeriodSelector
            currentType={periodType}
            currentYear={year}
            currentWeek={week}
            currentMonth={month}
            currentPeriodRankingExists={currentPeriodRankingExists}
            rankingPeriodId={currentPeriodRankingData?.rankingPeriodId}
            isVisible={currentPeriodRankingData?.isVisible}
            className="min-w-0 xl:max-w-[760px] xl:mr-auto"
          />
        ) : null}

        {currentView === 'past' ? (
          <PastRanksList
            initialData={initialPastRanksData}
            initialType={periodType}
            initialRequestedPeriod={
              !shouldResolveDefaultPastSelection && selectedYear !== null
                ? {
                    type: periodType,
                    year,
                    month: periodType === 'monthly' ? month : undefined,
                    week: periodType === 'weekly' ? week : undefined,
                  }
                : null
            }
            shouldResolveDefaultSelection={shouldResolveDefaultPastSelection}
          />
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
    </main>
  );
}
