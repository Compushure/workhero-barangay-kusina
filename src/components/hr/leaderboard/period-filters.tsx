'use client';

import React, { useMemo, useState } from 'react';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MonthPicker, YearPicker, WeekCalendar } from '@/components/shared/period-date-pickers';
import {
  buildAvailablePeriodKeys,
  getTriggerLabel,
  toPeriodSelectionKey,
} from '@/lib/utils/period-filter-utils';
import { cn } from '@/lib/utils';
import type { RankingPeriodType, RankingPeriodWithTop } from '@/types';

export const TAB_LABELS: Record<RankingPeriodType, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export const PERIOD_TYPES: RankingPeriodType[] = ['weekly', 'monthly', 'yearly'];

// ─── PeriodFilters ────────────────────────────────────────────────────────────

interface PeriodFiltersProps {
  activeTab: RankingPeriodType;
  selectedDate: Date | null;
  hasAnyPeriods: boolean;
  availablePeriods: RankingPeriodWithTop[];
  onTypeChange: (value: string) => void;
  onDateChange: (date: Date | null) => void;
}

export function PeriodFilters({
  activeTab,
  selectedDate,
  hasAnyPeriods,
  availablePeriods,
  onTypeChange,
  onDateChange,
}: PeriodFiltersProps) {
  const [open, setOpen] = useState(false);
  const selectContentClassName = 'manager-dropdown-content rounded-lg bg-popover text-popover-foreground';
  const selectItemClassName =
    'cursor-pointer transition-all duration-300 ease-in-out hover:bg-accent/15 hover:text-foreground data-[highlighted]:bg-accent/15 data-[highlighted]:text-foreground data-[state=checked]:bg-accent/15 data-[state=checked]:text-foreground';
  const availablePeriodKeys = useMemo(
    () => buildAvailablePeriodKeys(availablePeriods, activeTab),
    [availablePeriods, activeTab]
  );

  const handleSelect = (date: Date) => {
    onDateChange(date);
    setOpen(false);
  };

  const triggerLabel = getTriggerLabel(activeTab, selectedDate, {
    emptyLabel: 'Select a period',
  });
  const hasSelection = selectedDate !== null;
  const isDateSelectable = (date: Date) =>
    availablePeriodKeys.has(toPeriodSelectionKey(date, activeTab));

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[130px_210px]">
      <div className="flex w-full flex-col gap-1.5 xl:max-w-[130px]">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Select Period
        </span>
        <Select value={activeTab} onValueChange={onTypeChange}>
          <SelectTrigger className="control-h w-full cursor-pointer rounded-lg border border-border bg-card px-3.5 text-xs font-semibold text-primary shadow-sm sm:text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={selectContentClassName}>
            {PERIOD_TYPES.map((type) => (
              <SelectItem key={type} value={type} className={selectItemClassName}>
                {TAB_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex w-full flex-col gap-1.5 xl:max-w-[210px]">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Specific {TAB_LABELS[activeTab]} Period
        </span>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={!hasAnyPeriods}
              className={cn(
                'control-h flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3.5 text-left text-xs font-semibold shadow-sm transition sm:text-sm',
                hasAnyPeriods
                  ? 'cursor-pointer text-foreground hover:text-foreground'
                  : 'cursor-not-allowed text-muted-foreground opacity-60'
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                <CalendarIcon className="h-4 w-4 shrink-0 text-accent" />
                <span className={cn('truncate', !hasSelection && 'text-muted-foreground')}>
                  {hasAnyPeriods ? triggerLabel : 'No generated periods'}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto rounded-xl border border-border bg-white p-0 shadow-sm/25" align="start">
            {activeTab === 'weekly' && (
              <WeekCalendar
                selected={selectedDate}
                onSelect={handleSelect}
                variant="mercado"
                isDateSelectable={isDateSelectable}
              />
            )}
            {activeTab === 'monthly' && (
              <MonthPicker
                selected={selectedDate}
                onSelect={handleSelect}
                variant="mercado"
                isDateSelectable={isDateSelectable}
              />
            )}
            {activeTab === 'yearly' && (
              <YearPicker
                selected={selectedDate}
                onSelect={handleSelect}
                variant="mercado"
                isDateSelectable={isDateSelectable}
              />
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
