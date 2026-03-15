'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Eye, EyeOff, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination as PastRanksPagination } from '@/components/shared/pagination';
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
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-accent/20 bg-card px-4 py-4 shadow-sm/30 transition-colors hover:border-primary/40 hover:bg-background sm:flex-row sm:items-center sm:gap-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Calendar className="h-5 w-5" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-base font-semibold text-foreground sm:text-lg">{periodLabel(row)}</p>
          {row.is_visible ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
              <Eye className="h-3 w-3" />
              Visible
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <EyeOff className="h-3 w-3" />
              Hidden
            </span>
          )}
        </div>
        <p className="text-meta text-muted-foreground">{periodRangeLabel(row)}</p>
      </div>

      <div className="flex w-full shrink-0 items-center gap-4 sm:w-auto">
        <Button
          size="sm"
          onClick={() => onSelect(buildUrl(row))}
          className="control-h w-full shrink-0 rounded-full bg-primary-gradient px-6 text-sm font-semibold text-white shadow-sm hover:opacity-95 sm:w-auto"
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
      className="pointer-events-none flex w-full select-none flex-col gap-3 rounded-2xl border border-transparent bg-transparent px-4 py-4 opacity-0 sm:flex-row sm:items-center sm:gap-5"
      aria-hidden="true"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-base font-semibold text-foreground sm:text-lg">Placeholder</p>
        </div>
        <p className="text-meta text-muted-foreground">Placeholder</p>
      </div>
      <div className="flex w-full shrink-0 items-center gap-4 sm:w-auto">
        <Button size="sm" className="control-h w-full shrink-0 rounded-full sm:w-auto">
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
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-accent/30 bg-background/40 px-6 py-10 text-center">
      <History className="h-10 w-10 text-muted-foreground/40" />
      <p className="text-meta text-muted-foreground">
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
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex h-full flex-col gap-5 rounded-3xl border border-accent/20 bg-card p-4 shadow-sm/40 sm:p-6">
            <div>
              <h2 className="text-h1 text-foreground">Past Generated Ranks</h2>
              <p className="text-meta text-muted-foreground">
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

            <div className="flex flex-1 flex-col gap-3 overflow-hidden">
              {list.length === 0 ? (
                <PeriodEmptyState
                  activeTab={activeTab}
                  isNoData={grouped[activeTab].length === 0}
                />
              ) : (
                <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
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
