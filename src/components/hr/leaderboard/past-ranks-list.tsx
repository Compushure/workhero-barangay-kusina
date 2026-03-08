'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { History, Calendar, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, getISOWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, EyeOff } from 'lucide-react';
import { getAllRankingPeriods } from '@/actions/hr/leaderboard';
import type { RankingPeriodWithTop, RankingPeriodType } from '@/types';

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

function buildUrl(row: RankingPeriodWithTop): string {
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

const TAB_LABELS: Record<RankingPeriodType, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

const PERIOD_TYPES: RankingPeriodType[] = ['weekly', 'monthly', 'yearly'];
const PAGE_SIZE = 8;

function matchesSearch(row: RankingPeriodWithTop, query: string, label: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const generated = format(new Date(row.generated_at), 'MMM d, yyyy').toLowerCase();
  return label.toLowerCase().includes(q) || generated.includes(q);
}

interface PeriodRowProps {
  row: RankingPeriodWithTop;
  onSelect: (url: string) => void;
}


function PeriodRow({ row, onSelect }: PeriodRowProps) {
  return (
    <div className="w-full flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 transition-colors hover:border-primary/30">
      {/* Calendar icon */}
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 shrink-0">
        <Calendar className="w-5 h-5 text-blue-500" />
      </div>

      {/* Left: period info */}
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

      {/* Right: button */}
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

export function PastRanksList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<RankingPeriodType>('weekly');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [periods, setPeriods] = useState<RankingPeriodWithTop[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await getAllRankingPeriods();
      if (result.success) {
        setPeriods(result.data ?? []);
      } else {
        setError(result.error ?? 'Failed to load ranking periods.');
      }
    });
  }, []);

  const handleSelect = (url: string) => {
    router.push(url);
  };

  const grouped = (periods ?? []).reduce<Record<RankingPeriodType, RankingPeriodWithTop[]>>(
    (acc, row) => {
      acc[row.period_type].push(row);
      return acc;
    },
    { weekly: [], monthly: [], yearly: [] },
  );

  const filteredGrouped: Record<RankingPeriodType, RankingPeriodWithTop[]> = {
    weekly: grouped.weekly.filter((row) => matchesSearch(row, searchQuery, periodLabel(row))),
    monthly: grouped.monthly.filter((row) => matchesSearch(row, searchQuery, periodLabel(row))),
    yearly: grouped.yearly.filter((row) => matchesSearch(row, searchQuery, periodLabel(row))),
  };

  const handleTypeChange = (value: string) => {
    setActiveTab(value as RankingPeriodType);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {isPending && (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      )}

      {!isPending && error && (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!isPending && periods !== null && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col gap-5 h-full">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Past Generated Ranks</h2>
            <p className="text-sm text-muted-foreground">Browse previously generated rankings by period.</p>
          </div>

          {/* Filter row: dropdown + search */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 flex items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Select Period</label>
              <Select value={activeTab} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-44 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {TAB_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {periods.length > 0 && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Search by period or date."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 rounded-full bg-white"
                />
              </div>
            )}
          </div>

          {/* List */}
          {(() => {
            const list = filteredGrouped[activeTab];
            const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
            const page = Math.min(currentPage, totalPages);
            const start = (page - 1) * PAGE_SIZE;
            const paginatedList = list.slice(start, start + PAGE_SIZE);

            return (
              <div className="flex flex-col flex-1 overflow-hidden gap-2">
                {list.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 flex-1">
                    <History className="w-8 h-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      {grouped[activeTab].length === 0
                        ? `No ${TAB_LABELS[activeTab].toLowerCase()} rankings yet.`
                        : 'No matching periods.'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
                      {paginatedList.map((row) => (
                        <PeriodRow key={row.id} row={row} onSelect={handleSelect} />
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 shrink-0">
                        <p className="text-xs text-muted-foreground">
                          {start + 1}–{start + paginatedList.length} of {list.length}
                        </p>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <span className="text-xs font-medium text-foreground min-w-16 text-center">
                            Page {page} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
