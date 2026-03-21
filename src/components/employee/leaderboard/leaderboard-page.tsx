'use client';

import { useCallback, useMemo, useState } from 'react';
import { ChevronLeft, History } from 'lucide-react';
import {
  useGetEmployeeTopRanksByPeriod,
  useGetLatestLeaderboardPeriods,
} from '@/hooks/tanstack/queries/employeeQueries';
import { getISOWeekDateRangeLabel } from '@/lib/utils/time-period-utils';
import type { RankLogPeriodType } from '@/types';
import type { LatestPeriods } from './period-nav';
import { PeriodNav, getLeaderboardTitle, getLatestPeriodParams } from './period-nav';
import HeaderHUD from '../widgets/header-hud';
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
  const title = useMemo(
    () => getLeaderboardTitle(periodType, latestPeriods),
    [periodType, latestPeriods]
  );

  // Active period: use the selected past period when viewing history detail, otherwise the latest
  const activePeriod =
    view === 'history' && selectedPastPeriod ? selectedPastPeriod : currentPeriod;

  const activeWeeklyPeriod =
    activePeriod && activePeriod.periodType === 'weekly' ? activePeriod : null;
  const activeWeekNumber =
    activeWeeklyPeriod && typeof activeWeeklyPeriod.week === 'number'
      ? activeWeeklyPeriod.week
      : null;
  const activeWeekDateRange =
    activeWeeklyPeriod && typeof activeWeeklyPeriod.week === 'number'
      ? getISOWeekDateRangeLabel(activeWeeklyPeriod.year, activeWeeklyPeriod.week)
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

  const top3 = entries?.slice(0, 3) ?? [];
  const rest = entries?.slice(3, 10) ?? [];
  const hasEntries = entries && entries.length > 0;

  const showingPastDetail = view === 'history' && selectedPastPeriod !== null;

  return (
    <div className="relative h-screen w-full flex flex-col font-jersey tracking-widest overflow-hidden">
      {/* Fixed background layer (keeps image sizing stable across content height changes) */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/leaderboard-bg.png)' }}
        aria-hidden="true"
      />
      {/* Fixed dark overlay */}
      <div className="fixed inset-0 -z-10 bg-black/50 pointer-events-none" aria-hidden="true" />
      {/* HUD bar — fixed on sm+ so it stays top-left regardless of max-w centering */}
      <div
        className="relative z-20 w-full sm:fixed sm:left-0 sm:right-0 sm:top-0"
        style={{
          paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
          paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
          paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
          paddingBottom: '0.75rem',
        }}
      >
        <div className="flex w-full flex-col gap-2">
          <HeaderHUD className="rounded-lg" />
          <div className="flex w-full justify-end pr-1 sm:pr-2 lg:pr-4">
            <button
              type="button"
              onClick={handleToggleHistory}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-jersey tracking-widest shadow-[2px_2px_0_rgba(0,0,0,0.4)] transition-colors sm:px-4 sm:text-base ${
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

      {/* Spacer so content doesn't hide under the fixed HUD on sm+ */}
      <div
        className="hidden sm:block sm:h-[calc(max(0.75rem,env(safe-area-inset-top))+10rem)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col items-center px-3 pb-6 pt-4 sm:px-4 sm:pb-8 sm:pt-6 md:pt-8">
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

            {isLoading ? (
              <LeaderboardSkeleton variant="history" />
            ) : (
              <>
                {/* Title — same position as "Past Rankings" heading */}
                <header className="flex w-full max-w-4xl shrink-0 flex-col items-center min-h-40 pt-3 sm:min-h-44 md:min-h-56 md:pt-4">
                  <div className="flex min-h-18 w-full flex-col items-center justify-start sm:min-h-20 md:min-h-22">
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
                  </div>
                </header>
                <div className="flex w-full max-w-7xl flex-1 flex-col items-center pt-3 sm:pt-4">
                  {(!entries || entries.length === 0) && <LeaderboardEmptyState />}
                  {hasEntries && (
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
          </>
        )}

        {/* ── Current period view ── */}
        {view === 'current' && (
          <>
            {isLoading ? (
              <LeaderboardSkeleton variant="current" />
            ) : (
              <>
                <header className="flex w-full max-w-4xl shrink-0 flex-col items-center min-h-40 sm:min-h-44 md:min-h-56">
                  <div className="mb-4 sm:mb-6">
                    <PeriodNav
                      periodType={periodType}
                      onPeriodTypeChange={handlePeriodTypeChange}
                    />
                  </div>
                  <div className="flex min-h-18 w-full flex-col items-center justify-start sm:min-h-20 md:min-h-22">
                    {hasEntries && (
                      <>
                        <h1 className="text-center font-jersey text-2xl tracking-widest text-[#F4B925] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-3xl md:text-4xl">
                          {activeWeekNumber != null
                            ? `Top Kusineros of Week ${activeWeekNumber}`
                            : title}
                        </h1>
                        {activeWeekDateRange && (
                          <p className="mt-2 text-center font-jersey text-lg tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-xl md:text-2xl">
                            {activeWeekDateRange}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </header>

                {/* Content area: empty state, or podium + shelf */}
                <div className="flex w-full max-w-7xl flex-1 flex-col items-center pt-3 sm:pt-4">
                  {(!entries || entries.length === 0) && <LeaderboardEmptyState />}
                  {hasEntries && (
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
          </>
        )}
      </div>
    </div>
  );
}
