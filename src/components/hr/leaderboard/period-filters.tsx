'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RankingPeriodType } from '@/types';

export const TAB_LABELS: Record<RankingPeriodType, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export const PERIOD_TYPES: RankingPeriodType[] = ['weekly', 'monthly', 'yearly'];

interface PeriodFiltersProps {
  activeTab: RankingPeriodType;
  searchQuery: string;
  hasAnyPeriods: boolean;
  onTypeChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export function PeriodFilters({
  activeTab,
  searchQuery,
  hasAnyPeriods,
  onTypeChange,
  onSearchChange,
}: PeriodFiltersProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 flex items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Select Period
        </label>
        <Select value={activeTab} onValueChange={onTypeChange}>
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

      {hasAnyPeriods ? (
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search by period or date."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 rounded-full bg-white"
          />
        </div>
      ) : null}
    </div>
  );
}
