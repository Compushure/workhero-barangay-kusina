'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarIcon, Info } from 'lucide-react';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { MonthPicker, YearPicker, WeekCalendar } from '@/components/shared/period-date-pickers';
import {
  buildAvailablePeriodKeys,
  getTriggerLabel,
  matchesDate,
  toPeriodSelectionKey,
} from '@/lib/utils/period-filter-utils';
import {
  useGetEmployeeTopRanksByPeriod,
  useGetEmployeeVisiblePeriods,
} from '@/hooks/tanstack/queries/employeeQueries';
import { LeaderboardEmptyState } from './leaderboard-empty-state';
import { LeaderboardMobileCarousel } from './leaderboard-mobile-carousel';
import { LeaderboardPodium } from './leaderboard-podium';
import { LeaderboardShelf } from './leaderboard-shelf';
import { LeaderboardSkeleton } from './leaderboard-skeleton';
import { PeriodNav } from './period-nav';
import type { EmployeePeriodParams } from '@/action-handlers/employee/stats';
import type { RankingPeriodWithTop, RankingPeriodType, RankLogPeriodType } from '@/types';

const FILTER_PLACEHOLDER: Record<RankingPeriodType, string> = {
  weekly: 'Filter by week...',
  monthly: 'Filter by month...',
  yearly: 'Filter by year...',
};

function toPeriodParams(row: RankingPeriodWithTop): EmployeePeriodParams {
  const start = new Date(row.period_start + 'T00:00:00');
  if (row.period_type === 'weekly') {
    return { periodType: 'weekly', year: getISOWeekYear(start), week: getISOWeek(start) };
  }
  if (row.period_type === 'monthly') {
    return { periodType: 'monthly', year: start.getFullYear(), month: start.getMonth() + 1 };
  }
  return { periodType: 'yearly', year: start.getFullYear() };
}

function findNewestPeriod(rows: RankingPeriodWithTop[]): RankingPeriodWithTop | null {
  return rows.length > 0 ? rows[0] : null;
}

interface PastRanksListProps {
  onLoadingChange?: (loading: boolean) => void;
}

export function PastRanksList({ onLoadingChange }: PastRanksListProps) {
  const [activeTab, setActiveTab] = useState<RankingPeriodType>('weekly');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const { data: periods, isLoading: isPeriodsLoading, isError } = useGetEmployeeVisiblePeriods();

  const grouped = useMemo(
    () =>
      (periods ?? []).reduce<Record<RankingPeriodType, RankingPeriodWithTop[]>>(
        (acc, row) => {
          acc[row.period_type].push(row);
          return acc;
        },
        { weekly: [], monthly: [], yearly: [] }
      ),
    [periods]
  );

  const hasAnyPeriods = grouped[activeTab].length > 0;
  const availablePeriodKeys = useMemo(
    () => buildAvailablePeriodKeys(grouped[activeTab], activeTab),
    [grouped, activeTab]
  );
  const isDateSelectable = (date: Date) =>
    availablePeriodKeys.has(toPeriodSelectionKey(date, activeTab));

  const resolvedSelection = useMemo(() => {
    const activeRows = grouped[activeTab];
    const matchingPeriod =
      selectedDate === null
        ? null
        : activeRows.find((row) => matchesDate(row, selectedDate, activeTab)) ?? null;
    const fallbackPeriod = findNewestPeriod(activeRows);
    const resolvedPeriod = matchingPeriod ?? fallbackPeriod;

    return {
      selectedDate: resolvedPeriod ? new Date(resolvedPeriod.period_start + 'T00:00:00') : null,
      selectedPeriod: resolvedPeriod ? toPeriodParams(resolvedPeriod) : null,
    };
  }, [activeTab, grouped, selectedDate]);

  const selectedPeriod: EmployeePeriodParams | null = resolvedSelection.selectedPeriod;
  const displayDate = resolvedSelection.selectedDate;

  const { data: entries, isLoading: isRankingsLoading } = useGetEmployeeTopRanksByPeriod(selectedPeriod, {
    enabled: selectedPeriod !== null,
  });
  const isHistoryLoading =
    isPeriodsLoading ||
    (selectedPeriod !== null && isRankingsLoading) ||
    (!isPeriodsLoading && hasAnyPeriods && selectedPeriod === null);

  useEffect(() => {
    onLoadingChange?.(isHistoryLoading);
  }, [isHistoryLoading, onLoadingChange]);

  const rankedEntries =
    entries?.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    })) ?? [];
  const top3 = rankedEntries.slice(0, 3);
  const rest = rankedEntries.slice(3, 10);
  const hasEntries = rankedEntries.length > 0;
  const triggerLabel = getTriggerLabel(activeTab, displayDate);
  const pickerVariant = 'employee' as const;

  function handleTabChange(tab: RankingPeriodType) {
    setActiveTab(tab);
    setDatePickerOpen(false);

    const nextPeriod = findNewestPeriod(grouped[tab]);
    setSelectedDate(nextPeriod ? new Date(nextPeriod.period_start + 'T00:00:00') : null);
  }

  function handleDateSelect(date: Date) {
    if (!isDateSelectable(date)) return;

    setSelectedDate(date);
    setDatePickerOpen(false);
  }

  return (
    <div className="flex w-full flex-1 flex-col items-center gap-4 [overscroll-behavior-x:none] sm:gap-5">
      {!isHistoryLoading && (
        <div className="relative z-10 mb-4 flex w-full max-w-3xl shrink-0 flex-col items-center gap-4 px-1 sm:mb-5 sm:gap-5">
          <div className="mt-2 flex w-full max-w-[388px] flex-col items-center justify-center gap-3 sm:mt-3 sm:max-w-[412px] sm:flex-row sm:items-center sm:justify-center sm:gap-3">
            <div className="flex w-full justify-center sm:w-[52%]">
              <PeriodNav
                periodType={activeTab as RankLogPeriodType}
                onPeriodTypeChange={(value) => handleTabChange(value as RankingPeriodType)}
              />
            </div>
            <div className="w-full sm:w-[48%]">
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={!hasAnyPeriods}
                    className={cn(
                      'group flex min-h-10 w-full items-center gap-2 rounded-sm border-[3px] border-[#47331F] bg-[#6F4A2B] px-3 py-2 font-jersey text-sm tracking-[0.08em] shadow-[4px_4px_0px_#000] shadow-[#3017008e] outline-none transition-all duration-150 sm:min-h-11 sm:px-4 sm:text-base',
                      hasAnyPeriods
                        ? 'cursor-pointer text-white hover:translate-y-1 hover:bg-[#7C5432] hover:shadow-[2px_2px_0px_#000] focus-visible:translate-y-1 focus-visible:bg-[#7C5432] focus-visible:shadow-[2px_2px_0px_#000]'
                        : 'cursor-not-allowed text-white/45 opacity-70'
                    )}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border-2 border-[#47331F] bg-[#5B3E29] text-[#F4B925] shadow-[inset_0_1px_0_rgba(255,225,181,0.12)] sm:h-8 sm:w-8">
                      <CalendarIcon className="h-4 w-4 shrink-0 sm:h-[18px] sm:w-[18px]" />
                    </span>
                    <span
                      className={cn(
                        'flex-1 text-left leading-none text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.75)]',
                        displayDate === null && 'text-white/65'
                      )}
                    >
                      {hasAnyPeriods
                        ? displayDate
                          ? triggerLabel
                          : FILTER_PLACEHOLDER[activeTab]
                        : 'No generated periods'}
                    </span>
                    {displayDate && hasAnyPeriods && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className="ml-auto rounded-full p-0.5 text-[#CF8B22] transition-colors hover:text-[#F4B925]"
                            aria-label="Some rankings are hidden"
                          >
                            <Info className="h-4.5 w-4.5" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          sideOffset={8}
                          className="max-w-xs border-[#47331F]/30 bg-[#FFF2CC] font-jersey text-[#3B2A1A]"
                        >
                          Some rankings are hidden. Contact Human Resources about this concern.
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto rounded-sm border-[3px] border-[#47331F] bg-[linear-gradient(180deg,#5A3A21_0%,#2A1A0E_100%)] p-1 shadow-[4px_4px_0px_#000] shadow-[#3017008e]"
                  align="center"
                >
                  {activeTab === 'weekly' && (
                    <WeekCalendar
                      selected={displayDate}
                      onSelect={handleDateSelect}
                      variant={pickerVariant}
                      isDateSelectable={isDateSelectable}
                    />
                  )}
                  {activeTab === 'monthly' && (
                    <MonthPicker
                      selected={displayDate}
                      onSelect={handleDateSelect}
                      variant={pickerVariant}
                      isDateSelectable={isDateSelectable}
                    />
                  )}
                  {activeTab === 'yearly' && (
                    <YearPicker
                      selected={displayDate}
                      onSelect={handleDateSelect}
                      variant={pickerVariant}
                      isDateSelectable={isDateSelectable}
                    />
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      )}

      <div className="flex w-full flex-1 flex-col items-center">
        {isHistoryLoading ? <LeaderboardSkeleton variant="history" /> : null}

        {!isHistoryLoading && isError ? (
          <p className="text-center font-jersey text-sm tracking-widest text-red-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-base">
            Failed to load rankings. Please try again.
          </p>
        ) : null}

        {!isHistoryLoading && !isError && !selectedPeriod ? (
          <div className="flex w-full max-w-5xl flex-1 flex-col items-center pt-2 sm:pt-3 lg:pt-4">
            <LeaderboardEmptyState
              title="Ranking for this period was hidden."
              subtitle="Contact the Human Resources Office!"
            />
          </div>
        ) : null}

        {!isHistoryLoading && !isError && selectedPeriod ? (
          <div className="flex w-full max-w-5xl flex-1 flex-col items-center pt-2 sm:pt-3 lg:pt-4">
            {!hasEntries ? (
              <LeaderboardEmptyState
                title="Ranking for this period was hidden."
                subtitle="Contact the Human Resources Office!"
              />
            ) : (
              <>
                <LeaderboardMobileCarousel entries={rankedEntries.slice(0, 10)} />
                <div className="hidden w-full flex-col items-center gap-4 lg:flex lg:gap-5">
                  <LeaderboardPodium entries={top3} />
                  <LeaderboardShelf entries={rest} />
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
