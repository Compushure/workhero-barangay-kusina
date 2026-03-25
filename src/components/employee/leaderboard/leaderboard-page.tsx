'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { History, RefreshCcw } from 'lucide-react';
import {
  useGetEmployeeTopRanksByPeriod,
  useGetLatestLeaderboardPeriods,
} from '@/hooks/tanstack/queries/employeeQueries';
import { getISOWeekDateRangeLabel } from '@/lib/utils/time-period-utils';
import type { RankLogPeriodType } from '@/types';
import type { LatestPeriods } from './period-nav';
import { PeriodNav, getLatestPeriodParams } from './period-nav';
import HeaderHUD from '../widgets/header-hud';
import { LeaderboardEmptyState } from './leaderboard-empty-state';
import { LeaderboardPodium } from './leaderboard-podium';
import { LeaderboardShelf } from './leaderboard-shelf';
import { LeaderboardSkeleton } from './leaderboard-skeleton';
import { LeaderboardMobileCarousel } from './leaderboard-mobile-carousel';
import { PastRanksList } from './past-ranks-list';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

interface LeaderboardPageClientProps {
  latestPeriods: LatestPeriods;
  initialView?: 'current' | 'history';
}

export function LeaderboardPageClient({
  latestPeriods: initialLatestPeriods,
  initialView = 'current',
}: LeaderboardPageClientProps) {
  const [periodType, setPeriodType] = useState<RankLogPeriodType>('weekly');
  const [view, setView] = useState<'current' | 'history'>(initialView);
  const [isHistoryLoading, setIsHistoryLoading] = useState(initialView === 'history');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: latestPeriods = initialLatestPeriods } =
    useGetLatestLeaderboardPeriods(initialLatestPeriods);

  const currentPeriod = useMemo(
    () => getLatestPeriodParams(periodType, latestPeriods),
    [periodType, latestPeriods]
  );
  const latestPeriodMeta = latestPeriods[periodType];
  const isLatestPeriodHidden = Boolean(latestPeriodMeta && !latestPeriodMeta.is_visible);

  const activeWeeklyPeriod =
    currentPeriod && currentPeriod.periodType === 'weekly' ? currentPeriod : null;
  const activeWeekDateRange =
    activeWeeklyPeriod && typeof activeWeeklyPeriod.week === 'number'
      ? getISOWeekDateRangeLabel(activeWeeklyPeriod.year, activeWeeklyPeriod.week)
      : null;
  const activePeriodLabel =
    currentPeriod?.periodType === 'weekly'
      ? activeWeekDateRange
      : currentPeriod?.periodType === 'monthly' && typeof currentPeriod.month === 'number'
        ? `${MONTH_NAMES[currentPeriod.month - 1]} ${currentPeriod.year}`
        : currentPeriod?.periodType === 'yearly'
          ? `${currentPeriod.year}`
          : null;

  const { data: entries, isLoading } = useGetEmployeeTopRanksByPeriod(currentPeriod);

  const handlePeriodTypeChange = useCallback((newType: RankLogPeriodType) => {
    setPeriodType(newType);
  }, []);

  const handleToggleHistory = useCallback(() => {
    const nextView = view === 'history' ? 'current' : 'history';
    setView(nextView);
    setIsHistoryLoading(nextView === 'history');

    const params = new URLSearchParams(searchParams.toString());
    if (nextView === 'history') {
      params.set('view', 'history');
    } else {
      params.delete('view');
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams, view]);

  const rankedEntries =
    entries?.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    })) ?? [];
  const top3 = rankedEntries.slice(0, 3);
  const rest = rankedEntries.slice(3, 10);
  const hasEntries = rankedEntries.length > 0;

  const toggleButtonClass =
    'inline-flex min-h-10 min-w-0 basis-0 grow items-center justify-center gap-1.5 px-2.5 py-2 text-[13px] font-jersey leading-none tracking-[0.08em] whitespace-nowrap transition-all duration-150 ease-out sm:gap-2 sm:px-3 sm:text-[16px] sm:tracking-[0.08em] md:text-[18px]';

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden font-jersey tracking-widest">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/leaderboard-bg.png)' }}
        aria-hidden="true"
      />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-black/50" aria-hidden="true" />

      <div
        className="relative z-20 w-full sm:fixed sm:left-0 sm:right-0 sm:top-0"
        style={{
          paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
          paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
          paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
          paddingBottom: '0.75rem',
        }}
      >
        <HeaderHUD className="rounded-lg" />
      </div>

      <div
        className="hidden sm:block sm:h-[calc(max(0.75rem,env(safe-area-inset-top))+6.5rem)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-3 pb-5 pt-4 sm:px-4 sm:pb-7 sm:pt-6 md:pt-7">
        {!((view === 'current' && isLoading) || (view === 'history' && isHistoryLoading)) && (
          <div className="mb-5 w-full max-w-[388px] self-center rounded-[12px] border-[3px] border-[#47331F] bg-[linear-gradient(180deg,#6E4A2C_0%,#55361E_100%)] p-1.5 shadow-[0_10px_18px_rgba(0,0,0,0.28),4px_4px_0px_#000] shadow-[#3017008e] sm:mb-6 sm:max-w-[412px]">
            <div className="inline-flex w-full overflow-hidden rounded-[8px] border-2 border-[#7F5733] bg-[#5B3E29] shadow-[inset_0_1px_0_rgba(255,225,181,0.14)]">
              <button
                type="button"
                onClick={() => {
                  if (view !== 'current') {
                    handleToggleHistory();
                  }
                }}
                className={`${toggleButtonClass} ${
                  view === 'current'
                    ? 'cursor-not-allowed rounded-none translate-y-[3px] bg-[#CF8B22] text-white shadow-[inset_0_4px_0_rgba(77,44,16,0.26),inset_0_-2px_0_rgba(255,231,189,0.16)]'
                    : 'cursor-pointer rounded-none bg-[#CF8B22]/28 text-white/70 shadow-[0_5px_0_rgba(77,44,16,0.82)] hover:translate-y-[4px] hover:bg-[#CF8B22]/48 hover:text-white hover:shadow-[0_1px_0_rgba(77,44,16,0.78)]'
                }`}
                aria-pressed={view === 'current'}
              >
                <RefreshCcw className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                Latest Rankings
              </button>
              <button
                type="button"
                onClick={() => {
                  if (view !== 'history') {
                    handleToggleHistory();
                  }
                }}
                className={`${toggleButtonClass} border-l-[3px] border-[#47331F] ${
                  view === 'history'
                    ? 'cursor-not-allowed rounded-none translate-y-[3px] bg-[#CF8B22] text-white shadow-[inset_0_4px_0_rgba(77,44,16,0.26),inset_0_-2px_0_rgba(255,231,189,0.16)]'
                    : 'cursor-pointer rounded-none bg-[#CF8B22]/28 text-white/70 shadow-[0_5px_0_rgba(77,44,16,0.82)] hover:translate-y-[4px] hover:bg-[#CF8B22]/48 hover:text-white hover:shadow-[0_1px_0_rgba(77,44,16,0.78)]'
                }`}
                aria-pressed={view === 'history'}
              >
                <History className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                Past Rankings
              </button>
            </div>
          </div>
        )}

        {view === 'history' ? (
          <div className="flex w-full flex-1 flex-col items-center">
            <PastRanksList onLoadingChange={setIsHistoryLoading} />
          </div>
        ) : (
          <>
            {isLoading ? (
              <LeaderboardSkeleton variant="current" />
            ) : (
              <>
                <header className="mb-5 flex w-full max-w-3xl shrink-0 flex-col items-center gap-5 px-1 sm:mb-6 sm:gap-6">
                  <div className="mt-6 flex w-full max-w-[388px] justify-center sm:mt-7 sm:max-w-[412px]">
                    <PeriodNav
                      periodType={periodType}
                      onPeriodTypeChange={handlePeriodTypeChange}
                    />
                  </div>
                  <div className="flex min-h-10 w-full flex-col items-center justify-start sm:min-h-12">
                    {hasEntries && activePeriodLabel && (
                      <p className="text-center text-sm tracking-[0.16em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.75)] sm:text-base md:text-lg">
                        {activePeriodLabel}
                      </p>
                    )}
                  </div>
                </header>

                <div className="flex w-full max-w-5xl flex-1 flex-col items-center pt-3 sm:pt-4">
                  {rankedEntries.length === 0 && (
                    <LeaderboardEmptyState
                      title={
                        isLatestPeriodHidden
                          ? 'Ranking for this period was hidden.'
                          : "Rankings haven't been released yet."
                      }
                      subtitle={
                        isLatestPeriodHidden
                          ? 'Contact the Human Resources Office!'
                          : 'Check back later!'
                      }
                    />
                  )}
                  {hasEntries && (
                    <div className="flex w-full flex-col items-center gap-4 sm:gap-5">
                      <LeaderboardMobileCarousel entries={rankedEntries.slice(0, 10)} />
                      <div className="hidden w-full flex-col items-center gap-4 md:flex md:gap-5">
                        <LeaderboardPodium entries={top3} />
                        <LeaderboardShelf entries={rest} />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
