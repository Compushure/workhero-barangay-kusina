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
      {/* HUD — top left */}
      <div className="absolute top-4 left-4 flex flex-row items-center gap-6">
        <ProfileAndLevel />
        <XPProgressAndPoints />
      </div>

      {/* History toggle — top right */}
      <div className="absolute top-4 right-18 z-10">
        <button
          type="button"
          onClick={handleToggleHistory}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl mr-5 font-jersey tracking-widest text-base shadow-[2px_2px_0_rgba(0,0,0,0.4)] transition-colors ${
            view === 'history'
              ? 'bg-[#F4B925] text-[#3D2512]'
              : 'bg-[#694c33] text-white hover:bg-[#8A6342]'
          }`}
        >
          <History className="w-4 h-4" />
          Past Rankings
        </button>
      </div>

      <div className="flex flex-col items-center px-4 min-h-screen pt-20 md:pt-24">

        {/* ── History list view ── */}
        {view === 'history' && !selectedPastPeriod && (
          <div className="flex flex-col items-center w-full flex-1">
            <div className="relative z-10 w-full max-w-2xl px-4">
              <button
                type="button"
                onClick={handleToggleHistory}
                className="flex items-center gap-1 font-jersey tracking-widest text-[#F4B925] text-lg hover:text-[#F4B925]/70 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
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
            <div className="relative z-10 w-full max-w-2xl px-4">
              <button
                type="button"
                onClick={handleBackToHistory}
                className="flex items-center gap-1 font-jersey tracking-widest text-[#F4B925] text-lg hover:text-[#F4B925]/70 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
                Back to Past Rankings
              </button>
            </div>
            {/* Title — same position as "Past Rankings" heading */}
            <header className="flex w-full max-w-4xl flex-col items-center shrink-0 min-h-48 md:min-h-56 pt-4">
              {isLoading && (
                <div
                  className="h-8 md:h-10 w-64 md:w-96 rounded-lg bg-[#F4B925]/30 animate-pulse"
                  aria-hidden
                />
              )}
              {!isLoading && (
                <div className="flex flex-col items-center">
                  <h1 className="font-jersey tracking-widest text-[#F4B925] text-2xl md:text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center">
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
                    <p className="mt-2 font-jersey tracking-widest text-white text-xl md:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center">
                      {getISOWeekDateRangeLabel(
                        selectedPastPeriod.year,
                        (selectedPastPeriod as { week: number }).week
                      )}
                    </p>
                  )}
                </div>
              )}
            </header>
            <div className="flex flex-col items-center w-full max-w-7xl flex-1 pt-4">
              {isLoading && <LeaderboardSkeleton />}
              {!isLoading && (!entries || entries.length === 0) && <LeaderboardEmptyState />}
              {!isLoading && hasEntries && (
                <div className="flex flex-col items-center gap-8 w-full">
                  <LeaderboardPodium entries={top3} />
                  <LeaderboardShelf entries={rest} />
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Current period view ── */}
        {view === 'current' && (
          <>
            <header className="flex w-full max-w-4xl flex-col items-center shrink-0 min-h-48 md:min-h-56">
              <div className="mb-6">
                <PeriodNav periodType={periodType} onPeriodTypeChange={handlePeriodTypeChange} />
              </div>
              {isLoading && (
                <div
                  className="h-10 md:h-14 w-64 md:w-96 rounded-lg bg-[#F4B925]/30 animate-pulse"
                  aria-hidden
                />
              )}
              {!isLoading && hasEntries && (
                <>
                  <h1 className="font-jersey tracking-widest text-[#F4B925] text-3xl md:text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center">
                    {activeWeekNumber != null ? `Top Kusineros of Week ${activeWeekNumber}` : title}
                  </h1>
                  {activeWeekDateRange && (
                    <p className="mt-2 font-jersey tracking-widest text-white text-xl md:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center">
                      {activeWeekDateRange}
                    </p>
                  )}
                </>
              )}
            </header>

            {/* Content area: skeleton, empty state, or podium + shelf */}
            <div className="flex flex-col items-center w-full max-w-7xl flex-1 pt-4">
              {isLoading && <LeaderboardSkeleton />}
              {!isLoading && (!entries || entries.length === 0) && <LeaderboardEmptyState />}
              {!isLoading && hasEntries && (
                <div className="flex flex-col items-center gap-8 w-full">
                  <LeaderboardPodium entries={top3} />
                  <LeaderboardShelf entries={rest} />
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

