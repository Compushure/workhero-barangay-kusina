'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Users } from 'lucide-react';
import { format, getISOWeek } from 'date-fns';
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
      return `Week ${getISOWeek(start)}, ${start.getFullYear()}`;
    case 'monthly':
      return format(start, 'MMMM yyyy');
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

interface PastRanksListProps {
  onSelectPeriod: (params: EmployeePeriodParams) => void;
}

export function PastRanksList({ onSelectPeriod }: PastRanksListProps) {
  const [activeTab, setActiveTab] = useState<RankingPeriodType>('weekly');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data: periods, isLoading, isError } = useGetEmployeeVisiblePeriods();

  const grouped = (periods ?? []).reduce<Record<RankingPeriodType, RankingPeriodWithTop[]>>(
    (acc, row) => {
      acc[row.period_type].push(row);
      return acc;
    },
    { weekly: [], monthly: [], yearly: [] }
  );

  const list = periods !== null ? grouped[activeTab] : [];
  const normalizedSearch = search.trim().toLowerCase();
  const filteredList =
    normalizedSearch.length === 0
      ? list
      : list.filter((row) => {
          const label = periodLabel(row).toLowerCase();
          const top = (row.top_performer_name ?? '').toLowerCase();
          return label.includes(normalizedSearch) || top.includes(normalizedSearch);
        });

  const totalPages = Math.max(1, Math.ceil((filteredList?.length ?? 0) / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedList =
    filteredList?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE) ?? [];
  const placeholderCount = Math.max(0, PAGE_SIZE - paginatedList.length);

  function handleTabChange(tab: RankingPeriodType) {
    setActiveTab(tab);
    setPage(1);
    setSearch('');
  }

  return (
    <div className="relative z-10 flex flex-col items-center w-full max-w-xl mx-auto px-4 py-4 gap-4">
      {/* Title */}
      <h2 className="font-jersey tracking-widest text-[#F4B925] text-2xl md:text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center pt-0">
        Past Rankings
      </h2>

      {/* Period Tabs */}
      <div className="flex items-center gap-2">
        {PERIOD_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            className={`px-3 py-1.5 rounded-lg font-jersey tracking-widest text-base shadow-[2px_2px_0_rgba(0,0,0,0.4)] transition-colors ${
              activeTab === tab.key
                ? 'bg-[#F4B925] text-[#3D2512]'
                : 'bg-[#b07440] text-white hover:bg-[#8A6342]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="w-full">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={
            activeTab === 'weekly'
              ? 'Search week (e.g., "Week 1") or name…'
              : activeTab === 'monthly'
                ? 'Search month (e.g., "January 2026") or name…'
                : 'Search year (e.g., "2026") or name…'
          }
          className="w-full rounded-lg border border-[#b07440]/70 bg-[#3D2512]/75 px-4 py-2 font-jersey tracking-widest text-base text-white placeholder:text-white/50 shadow-[2px_2px_0_rgba(0,0,0,0.35)] outline-none focus:border-[#F4B925]/80 focus:ring-2 focus:ring-[#F4B925]/20"
        />
      </div>

      {/* Content */}
      <div className="w-full flex flex-col gap-2">
        {isLoading && (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-14 rounded-lg bg-[#3D2512]/70 border border-[#b07440]/40 animate-pulse"
              />
            ))}
          </>
        )}

        {isError && (
          <p className="font-jersey tracking-widest text-red-400 text-base text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Failed to load rankings. Please try again.
          </p>
        )}

        {!isLoading && !isError && paginatedList.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Trophy className="w-10 h-10 text-[#F4B925]/50" />
            <p className="font-jersey tracking-widest text-[#F4B925]/70 text-base text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {normalizedSearch.length > 0
                ? 'No results found. Try a different search.'
                : `No ${activeTab} rankings released yet.`}
            </p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          paginatedList.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => onSelectPeriod(toPeriodParams(row))}
              className="w-full flex items-center gap-3 rounded-lg border border-[#b07440]/60 bg-[#3D2512]/80 px-4 py-3 text-left transition-colors hover:border-[#F4B925]/70 hover:bg-[#4a2e18]/80 active:scale-[0.98]"
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#F4B925]/20 shrink-0">
                <Trophy className="w-4 h-4 text-[#F4B925]" />
              </div>

              {/* Label + meta */}
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <p className="font-jersey tracking-widest text-[#F4B925] text-base leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {periodLabel(row)}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {row.top_performer_name && (
                    <span className="font-jersey tracking-widest text-white/70 text-xs">
                      🥇 {row.top_performer_name}
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-jersey tracking-widest text-white/50 text-xs">
                    <Users className="w-3 h-3" />
                    {row.participant_count}
                  </span>
                </div>
              </div>

              {/* View caret */}
              <ChevronRight className="w-4 h-4 text-[#F4B925]/60 shrink-0" />
            </button>
          ))}

        {/* Placeholders to keep list height fixed, similar to HR leaderboard table */}
        {!isLoading &&
          !isError &&
          placeholderCount > 0 &&
          Array.from({ length: placeholderCount }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <button
              key={`placeholder-${index}`}
              type="button"
              disabled
              className="w-full flex items-center gap-3 rounded-lg border border-transparent bg-transparent px-4 py-3 opacity-0 pointer-events-none select-none"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#F4B925]/20 shrink-0" />
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <p className="font-jersey tracking-widest text-[#F4B925] text-base leading-tight">
                  placeholder
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-jersey tracking-widest text-white/70 text-xs">
                    placeholder
                  </span>
                  <span className="flex items-center gap-1 font-jersey tracking-widest text-white/50 text-xs">
                    placeholder
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#F4B925]/60 shrink-0" />
            </button>
          ))}
      </div>

      {/* Pagination */}
      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#b07440] text-white shadow-[2px_2px_0_rgba(0,0,0,0.4)] transition-colors hover:bg-[#8A6342] disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <span className="font-jersey tracking-widest text-[#F4B925] text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#b07440] text-white shadow-[-2px_2px_0_rgba(0,0,0,0.4)] transition-colors hover:bg-[#8A6342] disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}
