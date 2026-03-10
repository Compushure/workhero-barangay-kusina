'use client';

import { useCallback, useMemo, useState } from 'react';
import { ChevronLeft, History } from 'lucide-react';
import { useGetEmployeeTopRanksByPeriod } from '@/hooks/tanstack/queries/employeeQueries';
import { getISOWeekDateRangeLabel } from '@/lib/utils/time-period-utils';
import type { RankLogPeriodType } from '@/types';
import type { LatestPeriods } from './period-nav';
import { PeriodNav, getLeaderboardTitle, getLatestPeriodParams } from './period-nav';
import ProfileAndLevel from '../attendance/profile-level';
import XPProgressAndPoints from '../attendance/xp-points';
import { LeaderboardEmptyState } from './leaderboard-empty-state';
import { LeaderboardPodium } from './leaderboard-podium';
import { LeaderboardShelf } from './leaderboard-shelf';
import { LeaderboardSkeleton } from './leaderboard-skeleton';
import { LeaderboardMobileCarousel } from './leaderboard-mobile-carousel';
import { PastRanksList } from './past-ranks-list';
import type { EmployeePeriodParams } from '@/action-handlers/employee/stats';

interface LeaderboardPageClientProps {
  latestPeriods: LatestPeriods;
}

export function LeaderboardPageClient({ latestPeriods }: LeaderboardPageClientProps) {
  const [periodType, setPeriodType] = useState<RankLogPeriodType>('weekly');
  const [view, setView] = useState<'current' | 'history'>('current');
  const [selectedPastPeriod, setSelectedPastPeriod] = useState<EmployeePeriodParams | null>(null);

  const currentPeriod = useMemo(
    () => getLatestPeriodParams(periodType, latestPeriods),
    [periodType, latestPeriods]
  );
  const title = useMemo(
    () => getLeaderboardTitle(periodType, latestPeriods),
    [periodType, latestPeriods]
  );

  // Active period: use the selected past period when viewing history detail, otherwise the latest
  const activePeriod = view === 'history' && selectedPastPeriod ? selectedPastPeriod : currentPeriod;

  let activeWeekNumber: number | null = null;
  let activeWeekYear: number | null = null;
  let activeWeekDateRange: string | null = null;
  if (activePeriod && activePeriod.periodType === 'weekly') {
    activeWeekNumber = activePeriod.week;
    activeWeekYear = activePeriod.year;
    activeWeekDateRange = getISOWeekDateRangeLabel(activePeriod.year, activePeriod.week);
  }

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

  const top3 = entries?.slice(0, 3) ?? [];
  const rest = entries?.slice(3, 10) ?? [];
  const hasEntries = entries && entries.length > 0;

  const showingPastDetail = view === 'history' && selectedPastPeriod !== null;

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center flex flex-col font-jersey tracking-widest"
      style={{ backgroundImage: 'url(/assets/leaderboard-bg.png)' }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      <div
        className="relative z-10 w-full"
        style={{
          paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
          paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
          paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
        }}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 sm:gap-4">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4 md:gap-6">
              <ProfileAndLevel />
              <XPProgressAndPoints />
            </div>

            <button
              type="button"
              onClick={handleToggleHistory}
              className={`inline-flex min-h-11 items-center gap-2 self-start rounded-xl px-3 py-2 text-sm font-jersey tracking-widest shadow-[2px_2px_0_rgba(0,0,0,0.4)] transition-colors sm:px-4 sm:text-base ${
                view === 'history'
                  ? 'bg-[#F4B925] text-[#3D2512]'
                  : 'bg-[#694c33] text-white hover:bg-[#8A6342]'
              }`}
            >
              <History className="h-4 w-4" />
              Past Rankings
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl flex-col items-center px-3 pb-6 pt-4 sm:px-4 sm:pb-8 sm:pt-6 md:pt-8">

        {/* ── History list view ── */}
        {view === 'history' && !selectedPastPeriod && (
          <div className="flex w-full flex-1 flex-col items-center">
            <div className="relative z-10 w-full max-w-2xl px-1 sm:px-2">
              <button
                type="button"
                onClick={handleToggleHistory}
                className="inline-flex min-h-10 items-center gap-1 text-base font-jersey tracking-widest text-[#F4B925] transition-colors hover:text-[#F4B925]/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:text-lg"
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
                Back to Latest Rankings
              </button>
            </div>
            <PastRanksList onSelectPeriod={handleSelectPastPeriod} />
          </div>
        )}

        {/* ── Past period detail view ── */}
        {showingPastDetail && (
          <>
            <div className="relative z-10 w-full max-w-2xl px-1 sm:px-2">
              <button
                type="button"
                onClick={handleBackToHistory}
                className="inline-flex min-h-10 items-center gap-1 text-base font-jersey tracking-widest text-[#F4B925] transition-colors hover:text-[#F4B925]/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:text-lg"
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
                Back to Past Rankings
              </button>
            </div>
            {/* Title — same position as "Past Rankings" heading */}
            <header className="flex w-full max-w-4xl shrink-0 flex-col items-center min-h-40 pt-3 sm:min-h-44 md:min-h-56 md:pt-4">
              {isLoading && (
                <div
                  className="h-7 w-56 animate-pulse rounded-lg bg-[#F4B925]/30 sm:h-8 sm:w-64 md:h-10 md:w-96"
                  aria-hidden
                />
              )}
              {!isLoading && (
                <div className="flex flex-col items-center">
                  <h1 className="text-center font-jersey text-xl tracking-widest text-[#F4B925] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-2xl md:text-3xl">
                    {selectedPastPeriod.periodType === 'weekly' &&
                      `Top Kusineros of Week ${(selectedPastPeriod as { week: number }).week}`}
                    {selectedPastPeriod.periodType === 'monthly' &&
                      `Top Kusineros — ${new Date(
                        selectedPastPeriod.year,
                        (selectedPastPeriod as { month: number }).month - 1
                      ).toLocaleString('en', { month: 'long' })} ${selectedPastPeriod.year}`}
                    {selectedPastPeriod.periodType === 'yearly' &&
                      `Top Kusineros — Year ${selectedPastPeriod.year}`}
                  </h1>
                  {selectedPastPeriod.periodType === 'weekly' && (
                    <p className="mt-2 text-center font-jersey text-lg tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-xl md:text-2xl">
                      {getISOWeekDateRangeLabel(
                        selectedPastPeriod.year,
                        (selectedPastPeriod as { week: number }).week
                      )}
                    </p>
                  )}
                </div>
              )}
            </header>
            <div className="flex w-full max-w-7xl flex-1 flex-col items-center pt-3 sm:pt-4">
              {isLoading && <LeaderboardSkeleton />}
              {!isLoading && (!entries || entries.length === 0) && <LeaderboardEmptyState />}
              {!isLoading && hasEntries && (
                <>
                  <LeaderboardMobileCarousel entries={entries.slice(0, 10)} />
                  <div className="hidden w-full flex-col items-center gap-6 md:flex md:gap-8">
                    <LeaderboardPodium entries={top3} />
                    <LeaderboardShelf entries={rest} />
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* ── Current period view ── */}
        {view === 'current' && (
          <>
            <header className="flex w-full max-w-4xl shrink-0 flex-col items-center min-h-40 sm:min-h-44 md:min-h-56">
              <div className="mb-4 sm:mb-6">
                <PeriodNav periodType={periodType} onPeriodTypeChange={handlePeriodTypeChange} />
              </div>
              {isLoading && (
                <div
                  className="h-8 w-56 animate-pulse rounded-lg bg-[#F4B925]/30 sm:h-10 sm:w-64 md:h-14 md:w-96"
                  aria-hidden
                />
              )}
              {!isLoading && hasEntries && (
                <>
                  <h1 className="text-center font-jersey text-2xl tracking-widest text-[#F4B925] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-3xl md:text-4xl">
                    {activeWeekNumber != null ? `Top Kusineros of Week ${activeWeekNumber}` : title}
                  </h1>
                  {activeWeekDateRange && (
                    <p className="mt-2 text-center font-jersey text-lg tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-xl md:text-2xl">
                      {activeWeekDateRange}
                    </p>
                  )}
                </>
              )}
            </header>

            {/* Content area: skeleton, empty state, or podium + shelf */}
            <div className="flex w-full max-w-7xl flex-1 flex-col items-center pt-3 sm:pt-4">
              {isLoading && <LeaderboardSkeleton />}
              {!isLoading && (!entries || entries.length === 0) && <LeaderboardEmptyState />}
              {!isLoading && hasEntries && (
                <>
                  <LeaderboardMobileCarousel entries={entries.slice(0, 10)} />
                  <div className="hidden w-full flex-col items-center gap-6 md:flex md:gap-8">
                    <LeaderboardPodium entries={top3} />
                    <LeaderboardShelf entries={rest} />
                  </div>
                </>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

