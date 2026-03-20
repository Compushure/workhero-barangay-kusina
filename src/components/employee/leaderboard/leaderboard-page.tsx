'use client';

import { useCallback, useMemo, useState } from 'react';
import { ChevronLeft, History, RefreshCcw } from 'lucide-react';
import {
  useGetEmployeeTopRanksByPeriod,
  useGetLatestLeaderboardPeriods,
} from '@/hooks/tanstack/queries/employeeQueries';
import { getISOWeekDateRangeLabel } from '@/lib/utils/time-period-utils';
import type { RankLogPeriodType } from '@/types';
import type { LatestPeriods } from './period-nav';
import { PeriodNav, getLatestPeriodParams } from './period-nav';
import ProfileAndLevel from '../attendance/profile-level';
import XPProgressAndPoints from '../attendance/xp-points';
import { LeaderboardEmptyState } from './leaderboard-empty-state';
import { LeaderboardPodium } from './leaderboard-podium';
import { LeaderboardShelf } from './leaderboard-shelf';
import { LeaderboardSkeleton } from './leaderboard-skeleton';
import { LeaderboardMobileCarousel } from './leaderboard-mobile-carousel';
import { PastRanksList } from './past-ranks-list';
import type { EmployeePeriodParams } from '@/action-handlers/employee/stats';

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
}

export function LeaderboardPageClient({
  latestPeriods: initialLatestPeriods,
}: LeaderboardPageClientProps) {
  const [periodType, setPeriodType] = useState<RankLogPeriodType>('weekly');
  const [view, setView] = useState<'current' | 'history'>('current');
  const [selectedPastPeriod, setSelectedPastPeriod] = useState<EmployeePeriodParams | null>(null);

  const { data: latestPeriods = initialLatestPeriods } =
    useGetLatestLeaderboardPeriods(initialLatestPeriods);

  const currentPeriod = useMemo(
    () => getLatestPeriodParams(periodType, latestPeriods),
    [periodType, latestPeriods]
  );
  const activePeriod =
    view === 'history' && selectedPastPeriod ? selectedPastPeriod : currentPeriod;

  const activeWeeklyPeriod = activePeriod && activePeriod.periodType === 'weekly' ? activePeriod : null;
  const activeWeekDateRange =
    activeWeeklyPeriod && typeof activeWeeklyPeriod.week === 'number'
      ? getISOWeekDateRangeLabel(activeWeeklyPeriod.year, activeWeeklyPeriod.week)
      : null;
  const activePeriodLabel =
    activePeriod?.periodType === 'weekly'
      ? activeWeekDateRange
      : activePeriod?.periodType === 'monthly' && typeof activePeriod.month === 'number'
        ? `${MONTH_NAMES[activePeriod.month - 1]} ${activePeriod.year}`
        : activePeriod?.periodType === 'yearly'
          ? `${activePeriod.year}`
          : null;

  const { data: entries, isLoading } = useGetEmployeeTopRanksByPeriod(
    view === 'history' && selectedPastPeriod ? activePeriod : currentPeriod
  );

  const handlePeriodTypeChange = useCallback((newType: RankLogPeriodType) => {
    setPeriodType(newType);
  }, []);

  const handleSelectPastPeriod = useCallback((params: EmployeePeriodParams) => {
    setSelectedPastPeriod(params);
  }, []);

  const handleBackToHistory = useCallback(() => {
    setSelectedPastPeriod(null);
  }, []);

  const handleToggleHistory = useCallback(() => {
    setView((v) => {
      if (v === 'history') {
        setSelectedPastPeriod(null);
        return 'current';
      }
      return 'history';
    });
  }, []);

  const rankedEntries =
    entries?.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    })) ?? [];
  const top3 = rankedEntries.slice(0, 3);
  const rest = rankedEntries.slice(3, 10);
  const hasEntries = rankedEntries.length > 0;

  const showingPastDetail = view === 'history' && selectedPastPeriod !== null;
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
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4 md:gap-6">
            <ProfileAndLevel />
            <XPProgressAndPoints />
          </div>
        </div>
      </div>

      <div
        className="hidden sm:block sm:h-[calc(max(0.75rem,env(safe-area-inset-top))+6.5rem)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-3 pb-5 pt-4 sm:px-4 sm:pb-7 sm:pt-6 md:pt-7">
        {!showingPastDetail && !(view === 'current' && isLoading) && (
          <div className="mb-5 w-full max-w-[388px] self-center rounded-[12px] border-[3px] border-[#47331F] bg-[linear-gradient(180deg,#6E4A2C_0%,#55361E_100%)] p-1.5 shadow-[0_10px_18px_rgba(0,0,0,0.28),4px_4px_0px_#000] shadow-[#3017008e] sm:mb-6 sm:max-w-[412px]">
            <div className="inline-flex w-full overflow-hidden rounded-[8px] border-2 border-[#7F5733] bg-[#5B3E29] shadow-[inset_0_1px_0_rgba(255,225,181,0.14)]">
              <button
                type="button"
                onClick={() => {
                  if (view !== 'history') {
                    handleToggleHistory();
                  }
                }}
                className={`${toggleButtonClass} ${
                  view === 'history'
                    ? 'cursor-not-allowed rounded-none translate-y-[3px] bg-[#CF8B22] text-white shadow-[inset_0_4px_0_rgba(77,44,16,0.26),inset_0_-2px_0_rgba(255,231,189,0.16)]'
                    : 'cursor-pointer rounded-none bg-[#CF8B22]/28 text-white/70 shadow-[0_5px_0_rgba(77,44,16,0.82)] hover:translate-y-[4px] hover:bg-[#CF8B22]/48 hover:text-white hover:shadow-[0_1px_0_rgba(77,44,16,0.78)]'
                }`}
                aria-pressed={view === 'history'}
              >
                <History className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                Past Rankings
              </button>
              <button
                type="button"
                onClick={() => {
                  if (view !== 'current') {
                    handleToggleHistory();
                  }
                }}
                className={`${toggleButtonClass} border-l-[3px] border-[#47331F] ${
                  view === 'current'
                    ? 'cursor-not-allowed rounded-none translate-y-[3px] bg-[#CF8B22] text-white shadow-[inset_0_4px_0_rgba(77,44,16,0.26),inset_0_-2px_0_rgba(255,231,189,0.16)]'
                    : 'cursor-pointer rounded-none bg-[#CF8B22]/28 text-white/70 shadow-[0_5px_0_rgba(77,44,16,0.82)] hover:translate-y-[4px] hover:bg-[#CF8B22]/48 hover:text-white hover:shadow-[0_1px_0_rgba(77,44,16,0.78)]'
                }`}
                aria-pressed={view === 'current'}
              >
                <RefreshCcw className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                Latest Rankings
              </button>
            </div>
          </div>
        )}

        {view === 'history' && !selectedPastPeriod && (
          <div className="flex w-full flex-1 flex-col items-center">
            <PastRanksList onSelectPeriod={handleSelectPastPeriod} />
          </div>
        )}

        {showingPastDetail && (
          <>
            <div className="relative z-10 w-full max-w-2xl px-1 sm:px-2">
              <button
                type="button"
                onClick={handleBackToHistory}
                className="inline-flex min-h-10 cursor-pointer items-center gap-1 text-base tracking-widest text-[#F4B925] transition-colors hover:text-[#F4B925]/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:text-lg"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
                Back to Past Rankings
              </button>
            </div>

            {isLoading ? (
              <LeaderboardSkeleton variant="history" />
            ) : (
              <>
                <header className="flex min-h-40 w-full max-w-4xl shrink-0 flex-col items-center pt-3 sm:min-h-44 md:min-h-56 md:pt-4">
                  <div className="flex min-h-18 w-full flex-col items-center justify-start sm:min-h-20 md:min-h-22">
                    <div className="flex flex-col items-center">
                      <h1 className="text-center text-xl tracking-widest text-[#F4B925] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-2xl md:text-3xl">
                        {selectedPastPeriod.periodType === 'weekly' &&
                          `Top Kusineros of Week ${(selectedPastPeriod as { week: number }).week}`}
                        {selectedPastPeriod.periodType === 'monthly' &&
                          `Top Kusineros â€” ${new Date(
                            selectedPastPeriod.year,
                            (selectedPastPeriod as { month: number }).month - 1
                          ).toLocaleString('en', { month: 'long' })} ${selectedPastPeriod.year}`}
                        {selectedPastPeriod.periodType === 'yearly' &&
                          `Top Kusineros â€” Year ${selectedPastPeriod.year}`}
                      </h1>
                      {selectedPastPeriod.periodType === 'weekly' && (
                        <p className="mt-2 text-center text-lg tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-xl md:text-2xl">
                          {getISOWeekDateRangeLabel(
                            selectedPastPeriod.year,
                            (selectedPastPeriod as { week: number }).week
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </header>
                <div className="flex w-full max-w-7xl flex-1 flex-col items-center pt-3 sm:pt-4">
                  {rankedEntries.length === 0 && <LeaderboardEmptyState />}
                  {hasEntries && (
                    <>
                      <LeaderboardMobileCarousel entries={rankedEntries.slice(0, 10)} />
                      <div className="hidden w-full flex-col items-center gap-5 md:flex md:gap-6">
                        <LeaderboardPodium entries={top3} />
                        <LeaderboardShelf entries={rest} />
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {view === 'current' && (
          <>
            {isLoading ? (
              <LeaderboardSkeleton variant="current" />
            ) : (
              <>
                <header className="mb-5 flex w-full max-w-3xl shrink-0 flex-col items-center gap-5 px-1 sm:mb-6 sm:gap-6">
                  <div className="mt-6 flex w-full justify-center sm:mt-7">
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
                  {rankedEntries.length === 0 && <LeaderboardEmptyState />}
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
