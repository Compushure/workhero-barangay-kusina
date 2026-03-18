'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Trophy, CalendarIcon, X } from 'lucide-react';
import { format, getISOWeek } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { MonthPicker, YearPicker, WeekCalendar } from '@/components/shared/period-date-pickers';
import { getTriggerLabel, matchesDate, periodRangeLabel } from '@/lib/utils/period-filter-utils';
import { useGetEmployeeVisiblePeriods } from '@/hooks/tanstack/queries/employeeQueries';
import type { EmployeePeriodParams } from '@/action-handlers/employee/stats';
import type { RankingPeriodWithTop, RankingPeriodType } from '@/types';

const PAGE_SIZE = 7;

const PERIOD_TABS: { key: RankingPeriodType; label: string }[] = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

function periodLabel(row: RankingPeriodWithTop): string {
  const start = new Date(row.period_start + 'T00:00:00');
  switch (row.period_type) {
    case 'weekly':
      return `Week ${getISOWeek(start)}`;
    case 'monthly':
      return format(start, 'MMMM');
    case 'yearly':
      return `Year ${start.getFullYear()}`;
  }
}

function toPeriodParams(row: RankingPeriodWithTop): EmployeePeriodParams {
  const start = new Date(row.period_start + 'T00:00:00');
  if (row.period_type === 'weekly') {
    return { periodType: 'weekly', year: start.getFullYear(), week: getISOWeek(start) };
  }
  if (row.period_type === 'monthly') {
    return { periodType: 'monthly', year: start.getFullYear(), month: start.getMonth() + 1 };
  }
  return { periodType: 'yearly', year: start.getFullYear() };
}

// ─── PastRanksList ────────────────────────────────────────────────────────────

const FILTER_PLACEHOLDER: Record<RankingPeriodType, string> = {
  weekly: 'Filter by week…',
  monthly: 'Filter by month…',
  yearly: 'Filter by year…',
};

interface PastRanksListProps {
  onSelectPeriod: (params: EmployeePeriodParams) => void;
}

export function PastRanksList({ onSelectPeriod }: PastRanksListProps) {
  const [activeTab, setActiveTab] = useState<RankingPeriodType>('weekly');
  const [page, setPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const { data: periods, isLoading, isError } = useGetEmployeeVisiblePeriods();

  const grouped = (periods ?? []).reduce<Record<RankingPeriodType, RankingPeriodWithTop[]>>(
    (acc, row) => {
      acc[row.period_type].push(row);
      return acc;
    },
    { weekly: [], monthly: [], yearly: [] }
  );

  const list =
    periods !== null
      ? grouped[activeTab].filter((row) => matchesDate(row, selectedDate, activeTab))
      : [];

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedList = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const placeholderCount = Math.max(0, PAGE_SIZE - paginatedList.length);

  const hasSelection = selectedDate !== null;
  const triggerLabel = getTriggerLabel(activeTab, selectedDate);
  const pickerVariant = 'employee' as const;

  function handleTabChange(tab: RankingPeriodType) {
    setActiveTab(tab);
    setPage(1);
    setSelectedDate(null);
  }

  function handleDateSelect(date: Date) {
    setSelectedDate(date);
    setPage(1);
    setDatePickerOpen(false);
  }

  function handleClearDate(e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedDate(null);
    setPage(1);
  }

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-3 py-4 sm:px-4">
      {/* Title */}
      <h2 className="pt-0 text-center font-jersey text-xl tracking-widest text-[#F4B925] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-2xl md:text-3xl">
        Past Rankings
      </h2>

      {/* Period Tabs */}
      <div className="flex w-full flex-wrap items-center justify-center gap-2">
        {PERIOD_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            className={`min-h-10 rounded-lg px-3 py-2 text-sm font-jersey tracking-widest shadow-[2px_2px_0_rgba(0,0,0,0.4)] transition-colors sm:px-4 sm:text-base ${
              activeTab === tab.key
                ? 'bg-[#F4B925] text-[#3D2512]'
                : 'bg-[#b07440] text-white hover:bg-[#8A6342]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Date Picker */}
      <div className="w-full">
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg border border-[#b07440]/70 bg-[#3D2512]/75 px-3 py-2.5 font-jersey text-sm tracking-widest text-white shadow-[2px_2px_0_rgba(0,0,0,0.35)] outline-none transition-colors hover:border-[#F4B925]/60 focus:border-[#F4B925]/80 focus:ring-2 focus:ring-[#F4B925]/20 sm:px-4 sm:text-base"
            >
              <CalendarIcon className="h-4 w-4 shrink-0 text-[#F4B925]" />
              <span className={cn('flex-1 text-left', !hasSelection && 'text-white/50')}>
                {hasSelection ? triggerLabel : FILTER_PLACEHOLDER[activeTab]}
              </span>
              {hasSelection && (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Clear filter"
                  onClick={handleClearDate}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ')
                      handleClearDate(e as unknown as React.MouseEvent);
                  }}
                  className="ml-auto rounded-full p-0.5 text-white/50 transition-colors hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto border-[#b07440]/70 bg-[#2a1a0e] p-0"
            align="start"
          >
            {activeTab === 'weekly' && (
              <WeekCalendar
                selected={selectedDate}
                onSelect={handleDateSelect}
                variant={pickerVariant}
              />
            )}
            {activeTab === 'monthly' && (
              <MonthPicker
                selected={selectedDate}
                onSelect={handleDateSelect}
                variant={pickerVariant}
              />
            )}
            {activeTab === 'yearly' && (
              <YearPicker
                selected={selectedDate}
                onSelect={handleDateSelect}
                variant={pickerVariant}
              />
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Content */}
      <div className="relative flex w-full flex-col gap-2">
        {isLoading && (
          <>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div
                key={i}
                className="h-14 w-full animate-pulse rounded-lg border border-[#b07440]/40 bg-[#3D2512]/70"
              />
            ))}
          </>
        )}

        {isError && (
          <p className="text-center font-jersey text-sm tracking-widest text-red-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-base">
            Failed to load rankings. Please try again.
          </p>
        )}

        {!isLoading &&
          !isError &&
          paginatedList.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => onSelectPeriod(toPeriodParams(row))}
              className="flex min-h-12 w-full items-center gap-2.5 rounded-lg border border-[#b07440]/60 bg-[#3D2512]/80 px-3 py-3 text-left transition-colors hover:border-[#F4B925]/70 hover:bg-[#4a2e18]/80 active:scale-[0.98] sm:gap-3 sm:px-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#F4B925]/20">
                <Trophy className="h-4 w-4 text-[#F4B925]" />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="font-jersey text-sm leading-tight tracking-widest text-[#F4B925] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:text-base">
                  {periodLabel(row)}
                </p>
                <p className="font-jersey text-[11px] leading-tight tracking-widest text-white/70 sm:text-xs">
                  {periodRangeLabel(row)}
                </p>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-[#F4B925]/60" />
            </button>
          ))}

        {/* Always render placeholders to keep the list height stable regardless of data */}
        {!isLoading &&
          !isError &&
          Array.from({ length: placeholderCount }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <button
              key={`placeholder-${index}`}
              type="button"
              disabled
              aria-hidden="true"
              className="pointer-events-none flex w-full select-none items-center gap-2.5 rounded-lg border border-transparent bg-transparent px-3 py-3 opacity-0 sm:gap-3 sm:px-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#F4B925]/20" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="font-jersey text-sm leading-tight tracking-widest text-[#F4B925] sm:text-base">
                  placeholder
                </p>
                <p className="font-jersey text-[11px] leading-tight tracking-widest text-white/70 sm:text-xs">
                  placeholder
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#F4B925]/60" />
            </button>
          ))}

        {/* Empty state overlaid on the placeholder rows so height never changes */}
        {!isLoading && !isError && paginatedList.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Trophy className="h-10 w-10 text-[#F4B925]/50" />
            <p className="text-center font-jersey text-sm tracking-widest text-[#F4B925]/70 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-base">
              {hasSelection
                ? 'No rankings found for this period.'
                : `No ${activeTab} rankings released yet.`}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#b07440] text-white shadow-[2px_2px_0_rgba(0,0,0,0.4)] transition-colors hover:bg-[#8A6342] disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <span className="font-jersey text-base tracking-widest text-[#F4B925] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#b07440] text-white shadow-[-2px_2px_0_rgba(0,0,0,0.4)] transition-colors hover:bg-[#8A6342] disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}
