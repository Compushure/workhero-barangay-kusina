import { useState, useTransition, useEffect } from 'react';
import { format, getISOWeek } from 'date-fns';
import { getAllRankingPeriods } from '@/actions/hr/leaderboard';
import type { ActionResult } from '@/lib/utils/safe-action';
import type { RankingPeriodWithTop, RankingPeriodType } from '@/types';

export const PAST_RANKS_PAGE_SIZE = 7;

const PAGE_SIZE = PAST_RANKS_PAGE_SIZE;

export function periodLabel(row: RankingPeriodWithTop): string {
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

export function buildUrl(row: RankingPeriodWithTop): string {
  const start = new Date(row.period_start + 'T00:00:00');
  const params = new URLSearchParams({ type: row.period_type, show: '1', view: 'past' });

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

function matchesSearch(row: RankingPeriodWithTop, query: string, label: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const generated = format(new Date(row.generated_at), 'MMM d, yyyy').toLowerCase();
  return label.toLowerCase().includes(q) || generated.includes(q);
}

interface UsePastRanksFilterParams {
  initialData?: ActionResult<RankingPeriodWithTop[]> | null;
  activeTab: RankingPeriodType;
  currentPage: number;
  searchQuery: string;
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
  searchQuery,
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
    weekly: grouped.weekly.filter((row) => matchesSearch(row, searchQuery, periodLabel(row))),
    monthly: grouped.monthly.filter((row) => matchesSearch(row, searchQuery, periodLabel(row))),
    yearly: grouped.yearly.filter((row) => matchesSearch(row, searchQuery, periodLabel(row))),
  };

  const list = periods !== null ? filteredGrouped[activeTab] : [];
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginatedList = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return { periods, error, isPending, grouped, list, paginatedList, totalPages, page };
}
