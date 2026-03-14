import { useState, useTransition, useEffect } from 'react';
import { format, getISOWeek } from 'date-fns';
import { getAllRankingPeriods } from '@/actions/hr/leaderboard';
import { matchesDate } from '@/lib/utils/period-filter-utils';
import type { ActionResult } from '@/lib/utils/safe-action';
import type { RankingPeriodWithTop, RankingPeriodType } from '@/types';

export const PAST_RANKS_PAGE_SIZE = 7;

const PAGE_SIZE = PAST_RANKS_PAGE_SIZE;

export function periodLabel(row: RankingPeriodWithTop): string {
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

/** Human-readable date range for the period (e.g. "Mar 2 – Mar 8, 2026"). */
export function periodRangeLabel(row: RankingPeriodWithTop): string {
  const start = new Date(row.period_start + 'T00:00:00');
  const end = new Date(row.period_end + 'T00:00:00');
  if (row.period_type === 'yearly') {
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
  }
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const startStr = format(start, 'MMM d');
  const endStr = sameMonth ? format(end, 'd, yyyy') : format(end, 'MMM d, yyyy');
  return `${startStr} – ${endStr}`;
}

export function buildUrl(row: RankingPeriodWithTop): string {
  const start = new Date(row.period_start + 'T00:00:00');
  const params = new URLSearchParams({ type: row.period_type, view: 'past', show: '1' });

  if (row.period_type === 'weekly') {
    params.set('year', String(start.getFullYear()));
    params.set('week', String(getISOWeek(start)));
  } else if (row.period_type === 'monthly') {
    params.set('year', String(start.getFullYear()));
    params.set('month', String(start.getMonth() + 1));
  } else {
    params.set('year', String(start.getFullYear()));
  }

  return `/hr/leaderboard?${params.toString()}`;
}

interface UsePastRanksFilterParams {
  initialData?: ActionResult<RankingPeriodWithTop[]> | null;
  activeTab: RankingPeriodType;
  currentPage: number;
  selectedDate: Date | null;
}

interface UsePastRanksFilterResult {
  periods: RankingPeriodWithTop[] | null;
  error: string | null;
  isPending: boolean;
  grouped: Record<RankingPeriodType, RankingPeriodWithTop[]>;
  list: RankingPeriodWithTop[];
  paginatedList: RankingPeriodWithTop[];
  totalPages: number;
  page: number;
}

export function usePastRanksFilter({
  initialData,
  activeTab,
  currentPage,
  selectedDate,
}: UsePastRanksFilterParams): UsePastRanksFilterResult {
  const [periods, setPeriods] = useState<RankingPeriodWithTop[] | null>(() =>
    initialData?.success === true ? initialData.data ?? [] : null
  );
  const [error, setError] = useState<string | null>(() =>
    initialData?.success === false ? initialData.error : null
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialData != null) return;
    startTransition(async () => {
      const result = await getAllRankingPeriods();
      if (result.success) {
        setPeriods(result.data ?? []);
      } else {
        setError(result.error ?? 'Failed to load ranking periods.');
      }
    });
  }, [initialData]);

  const grouped = (periods ?? []).reduce<Record<RankingPeriodType, RankingPeriodWithTop[]>>(
    (acc, row) => {
      acc[row.period_type].push(row);
      return acc;
    },
    { weekly: [], monthly: [], yearly: [] }
  );

  const filteredGrouped: Record<RankingPeriodType, RankingPeriodWithTop[]> = {
    weekly: grouped.weekly.filter((row) => matchesDate(row, selectedDate, 'weekly')),
    monthly: grouped.monthly.filter((row) => matchesDate(row, selectedDate, 'monthly')),
    yearly: grouped.yearly.filter((row) => matchesDate(row, selectedDate, 'yearly')),
  };

  const list = periods !== null ? filteredGrouped[activeTab] : [];
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginatedList = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return { periods, error, isPending, grouped, list, paginatedList, totalPages, page };
}
