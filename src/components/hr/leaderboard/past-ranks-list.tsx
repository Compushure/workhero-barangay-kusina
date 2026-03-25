'use client';

import { useMemo, useState } from 'react';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import { History } from 'lucide-react';
import { PastRanksListSkeleton } from '@/components/hr/leaderboard/past-ranks-list-skeleton';
import { PeriodFilters, TAB_LABELS } from '@/components/hr/leaderboard/period-filters';
import { LeaderboardContent } from '@/components/hr/leaderboard/leaderboard-content';
import VisibilityToggle from '@/components/hr/leaderboard/visibility-toggle';
import { usePastRanksFilter } from '@/hooks/hr/usePastRanksFilter';
import { matchesDate } from '@/lib/utils/period-filter-utils';
import type { ActionResult } from '@/lib/utils/safe-action';
import type { RankingPeriodWithTop, RankingPeriodType } from '@/types';

interface PeriodReference {
  type: RankingPeriodType;
  year: number;
  month?: number;
  week?: number;
}

function findMatchingPeriod(
  rows: RankingPeriodWithTop[],
  reference: PeriodReference | null | undefined
): RankingPeriodWithTop | null {
  if (!reference) return null;

  return (
    rows.find((row) => {
      if (row.period_type !== reference.type) return false;

      const start = new Date(row.period_start + 'T00:00:00');
      if (reference.type === 'weekly') {
        return getISOWeekYear(start) === reference.year && getISOWeek(start) === reference.week;
      }

      if (reference.type === 'monthly') {
        return start.getFullYear() === reference.year && start.getMonth() + 1 === reference.month;
      }

      return start.getFullYear() === reference.year;
    }) ?? null
  );
}

function findNewestPeriod(rows: RankingPeriodWithTop[]): RankingPeriodWithTop | null {
  return rows.length > 0 ? rows[0] : null;
}

function PeriodEmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-accent/30 bg-background/40 px-6 py-10 text-center">
      <History className="h-10 w-10 text-muted-foreground/40" />
      <p className="text-meta text-muted-foreground">{message}</p>
    </div>
  );
}

interface PastRanksListProps {
  /** When provided (e.g. from server), list renders immediately without client fetch */
  initialData?: ActionResult<RankingPeriodWithTop[]> | null;
  initialType: RankingPeriodType;
  initialRequestedPeriod?: PeriodReference | null;
  shouldResolveDefaultSelection?: boolean;
}

export function PastRanksList({
  initialData,
  initialType,
  initialRequestedPeriod = null,
  shouldResolveDefaultSelection = false,
}: PastRanksListProps) {
  const [activeTab, setActiveTab] = useState<RankingPeriodType>(initialType);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [useRequestedFallback, setUseRequestedFallback] = useState(initialRequestedPeriod !== null);

  const { periods, error, isPending, grouped } = usePastRanksFilter({
    initialData,
    activeTab,
    currentPage: 1,
    selectedDate: null,
  });

  const resolvePeriodForTab = useMemo(
    () => (tab: RankingPeriodType, options?: { useRequestedPeriod?: boolean }) => {
      const rows = grouped[tab];
      if (rows.length === 0) return null;

      if (options?.useRequestedPeriod && initialRequestedPeriod?.type === tab) {
        return findMatchingPeriod(rows, initialRequestedPeriod) ?? rows[0];
      }

      if (shouldResolveDefaultSelection) {
        return findNewestPeriod(rows);
      }

      return findNewestPeriod(rows);
    },
    [grouped, initialRequestedPeriod, shouldResolveDefaultSelection]
  );

  const selectedPeriod = useMemo(() => {
    const activeRows = grouped[activeTab];
    if (activeRows.length === 0) return null;

    const matchingPeriod =
      selectedDate === null
        ? null
        : activeRows.find((row) => matchesDate(row, selectedDate, activeTab)) ?? null;

    if (matchingPeriod) {
      return matchingPeriod;
    }

    return resolvePeriodForTab(activeTab, { useRequestedPeriod: useRequestedFallback });
  }, [activeTab, grouped, resolvePeriodForTab, selectedDate, useRequestedFallback]);

  const displayDate = selectedPeriod ? new Date(selectedPeriod.period_start + 'T00:00:00') : null;

  const handleTypeChange = (value: string) => {
    const nextTab = value as RankingPeriodType;
    setActiveTab(nextTab);
    setUseRequestedFallback(false);
    const nextPeriod = resolvePeriodForTab(nextTab);
    setSelectedDate(nextPeriod ? new Date(nextPeriod.period_start + 'T00:00:00') : null);
  };

  const handleDateChange = (date: Date | null) => {
    setUseRequestedFallback(false);
    setSelectedDate(date);
  };

  const emptyMessage =
    grouped[activeTab].length === 0
      ? `No ${TAB_LABELS[activeTab].toLowerCase()} rankings yet.`
      : `No older ${TAB_LABELS[activeTab].toLowerCase()} ranking is available from this view yet.`;

  return (
    <div className="flex h-full flex-col gap-4">
      {isPending ? <PastRanksListSkeleton /> : null}

      {!isPending && error ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      {!isPending && periods !== null ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="manager-sticky-controls !mx-0 w-full rounded-2xl p-3 sm:p-3.5 xl:max-w-[574px]">
              <PeriodFilters
                activeTab={activeTab}
                selectedDate={displayDate}
                hasAnyPeriods={grouped[activeTab].length > 0}
                availablePeriods={grouped[activeTab]}
                onTypeChange={handleTypeChange}
              onDateChange={handleDateChange}
              trailingContent={
                selectedPeriod ? (
                  <VisibilityToggle
                    rankingPeriodId={selectedPeriod.id}
                    isVisible={selectedPeriod.is_visible}
                    className="w-full"
                  />
                ) : null
              }
            />
          </div>

          <div className="flex flex-1 flex-col gap-3">
            {selectedPeriod ? (
                <LeaderboardContent
                  periodType={selectedPeriod.period_type}
                  year={getISOWeekYear(new Date(selectedPeriod.period_start + 'T00:00:00'))}
                  week={getISOWeek(new Date(selectedPeriod.period_start + 'T00:00:00'))}
                  month={new Date(selectedPeriod.period_start + 'T00:00:00').getMonth() + 1}
                  show
                  periodHeaderLabel="Past Period"
                />
            ) : (
              <PeriodEmptyState message={emptyMessage} />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
