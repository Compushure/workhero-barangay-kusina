'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Eye, EyeOff, History } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Pagination as PastRanksPagination } from '@/components/manager/task-verification/pagination';
import { PastRanksListSkeleton } from '@/components/hr/leaderboard/past-ranks-list-skeleton';
import { PeriodFilters, TAB_LABELS } from '@/components/hr/leaderboard/period-filters';
import {
  usePastRanksFilter,
  periodLabel,
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
    <div className="w-full flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 transition-colors hover:border-primary/30">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 shrink-0">
        <Calendar className="w-5 h-5 text-gray-500" />
      </div>

      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-base text-foreground">{periodLabel(row)}</p>
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
        <p className="text-xs text-muted-foreground">
          Generated
          <span className="mx-1">·</span>
          {format(new Date(row.generated_at), 'MMM d, yyyy')}
        </p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect(buildUrl(row))}
          className="shrink-0 font-semibold"
        >
          View Ranking
        </Button>
      </div>
    </div>
  );
}

function PeriodRowPlaceholder() {
  return (
    <div
      className="w-full flex items-center gap-4 rounded-xl border border-transparent bg-transparent px-5 py-4 opacity-0 pointer-events-none select-none"
      aria-hidden="true"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 shrink-0" />
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-base text-foreground">Placeholder</p>
        </div>
        <p className="text-xs text-muted-foreground">Placeholder</p>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <Button variant="outline" size="sm" className="shrink-0 font-semibold">
          View Ranking
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
  const [searchQuery, setSearchQuery] = useState('');

  const { periods, error, isPending, grouped, list, paginatedList, totalPages, page } =
    usePastRanksFilter({ initialData, activeTab, currentPage, searchQuery });

  const placeholderCount = Math.max(0, PAST_RANKS_PAGE_SIZE - paginatedList.length);

  const handleTypeChange = (value: string) => {
    setActiveTab(value as RankingPeriodType);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
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
          <div className="rounded-2xl border border-gray-200 bg-white p-4 flex flex-col gap-5 h-full">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Past Generated Ranks
              </h2>
              <p className="text-sm text-muted-foreground">
                Browse previously generated rankings by period.
              </p>
            </div>

            <PeriodFilters
              activeTab={activeTab}
              searchQuery={searchQuery}
              hasAnyPeriods={(periods?.length ?? 0) > 0}
              onTypeChange={handleTypeChange}
              onSearchChange={handleSearchChange}
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
