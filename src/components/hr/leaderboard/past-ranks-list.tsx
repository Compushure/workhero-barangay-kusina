'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Eye, EyeOff, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination as PastRanksPagination } from '@/components/manager/task-verification/pagination';
import { PastRanksListSkeleton } from '@/components/hr/leaderboard/past-ranks-list-skeleton';
import { PeriodFilters, TAB_LABELS } from '@/components/hr/leaderboard/period-filters';
import {
  usePastRanksFilter,
  periodLabel,
  periodRangeLabel,
  buildUrl,
  PAST_RANKS_PAGE_SIZE,
} from '@/hooks/hr/usePastRanksFilter';
import type { ActionResult } from '@/lib/utils/safe-action';
import type { RankingPeriodWithTop, RankingPeriodType } from '@/types';

interface PeriodRowProps {
  row: RankingPeriodWithTop;
  onSelect: (url: string) => void;
}

function PeriodRow({ row, onSelect }: PeriodRowProps) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 transition-colors hover:border-primary/30 sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
        <Calendar className="w-5 h-5 text-gray-500" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold text-foreground sm:text-base">{periodLabel(row)}</p>
          {row.is_visible ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
              <Eye className="w-3 h-3" />
              Visible
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
              <EyeOff className="w-3 h-3" />
              Hidden
            </span>
          )}
        </div>
        <p className="text-xs font-normal text-muted-foreground">{periodRangeLabel(row)}</p>
      </div>

      <div className="flex w-full shrink-0 items-center gap-4 sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect(buildUrl(row))}
          className="min-h-10 w-full shrink-0 font-semibold sm:w-auto"
        >
          View Rankings
        </Button>
      </div>
    </div>
  );
}

function PeriodRowPlaceholder() {
  return (
    <div
      className="pointer-events-none flex w-full select-none flex-col gap-3 rounded-xl border border-transparent bg-transparent px-3 py-3 opacity-0 sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-4"
      aria-hidden="true"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold text-foreground sm:text-base">Placeholder</p>
        </div>
        <p className="text-xs text-muted-foreground">Placeholder</p>
      </div>
      <div className="flex w-full shrink-0 items-center gap-4 sm:w-auto">
        <Button variant="outline" size="sm" className="min-h-10 w-full shrink-0 font-semibold sm:w-auto">
          View Rankings
        </Button>
      </div>
    </div>
  );
}

function PeriodEmptyState({
  activeTab,
  isNoData,
}: {
  activeTab: RankingPeriodType;
  isNoData: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2 flex-1">
      <History className="w-8 h-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">
        {isNoData
          ? `No ${TAB_LABELS[activeTab].toLowerCase()} rankings yet.`
          : 'No matching periods.'}
      </p>
    </div>
  );
}

interface PastRanksListProps {
  /** When provided (e.g. from server), list renders immediately without client fetch */
  initialData?: ActionResult<RankingPeriodWithTop[]> | null;
}

export function PastRanksList({ initialData }: PastRanksListProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<RankingPeriodType>('weekly');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { periods, error, isPending, grouped, list, paginatedList, totalPages, page } =
    usePastRanksFilter({ initialData, activeTab, currentPage, selectedDate });

  const placeholderCount = Math.max(0, PAST_RANKS_PAGE_SIZE - paginatedList.length);

  const handleTypeChange = (value: string) => {
    setActiveTab(value as RankingPeriodType);
    setCurrentPage(1);
    setSelectedDate(null);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setCurrentPage(1);
  };

  const showContent = !isPending && periods !== null;

  return (
    <div className="flex flex-col gap-4 h-full">
      {isPending ? <PastRanksListSkeleton /> : null}

      {!isPending && error ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      {showContent ? (
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          <div className="flex h-full flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Past Generated Ranks
              </h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Browse previously generated rankings.
              </p>
            </div>

            <PeriodFilters
              activeTab={activeTab}
              selectedDate={selectedDate}
              hasAnyPeriods={(periods?.length ?? 0) > 0}
              onTypeChange={handleTypeChange}
              onDateChange={handleDateChange}
            />

            <div className="flex flex-col flex-1 overflow-hidden gap-2">
              {list.length === 0 ? (
                <PeriodEmptyState
                  activeTab={activeTab}
                  isNoData={grouped[activeTab].length === 0}
                />
              ) : (
                <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
                  {paginatedList.map((row) => (
                    <PeriodRow key={row.id} row={row} onSelect={(url) => router.push(url)} />
                  ))}
                  {Array.from({ length: placeholderCount }).map((_, index) => (
                    <PeriodRowPlaceholder key={`placeholder-${index}`} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {list.length > 0 ? (
            <div className={totalPages <= 1 ? 'invisible' : ''}>
              <PastRanksPagination
                totalPages={totalPages}
                currentPage={page}
                onPageChange={setCurrentPage}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
