'use client';

import React, { useState } from 'react';
import { CalendarIcon, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MonthPicker, YearPicker, WeekCalendar } from '@/components/shared/period-date-pickers';
import { getTriggerLabel } from '@/lib/utils/period-filter-utils';
import { cn } from '@/lib/utils';
import type { RankingPeriodType } from '@/types';

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
  onTypeChange: (value: string) => void;
  onDateChange: (date: Date | null) => void;
}

export function PeriodFilters({
  activeTab,
  selectedDate,
  hasAnyPeriods,
  onTypeChange,
  onDateChange,
}: PeriodFiltersProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (date: Date) => {
    onDateChange(date);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange(null);
  };

  const triggerLabel = getTriggerLabel(activeTab, selectedDate, {
    emptyLabel: 'All periods',
  });
  const hasSelection = selectedDate !== null;

  return (
    <div className="inline-flex w-full flex-col overflow-hidden rounded-2xl border border-accent/20 bg-card shadow-sm/30 sm:flex-row sm:items-stretch">
      {/* TYPE column */}
      <div className="flex min-w-[140px] flex-col gap-0.5 px-4 py-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Select Period
        </span>
        <Select value={activeTab} onValueChange={onTypeChange}>
          <SelectTrigger className="h-auto gap-1.5 border-0 bg-transparent p-0 text-sm font-semibold text-foreground shadow-none focus-visible:ring-0 [&>svg]:text-muted-foreground">
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

      {/* Divider + DATE column */}
      {hasAnyPeriods ? (
        <>
          <div className="h-px w-full bg-accent/20 sm:h-auto sm:w-px" />
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="group flex min-w-[180px] flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-background/80"
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Filter by {TAB_LABELS[activeTab]}
                </span>
                <span className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 shrink-0 text-primary" />
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      !hasSelection && 'text-muted-foreground'
                    )}
                  >
                    {triggerLabel}
                  </span>
                  {hasSelection && (
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label="Clear filter"
                      onClick={handleClear}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ')
                          handleClear(e as unknown as React.MouseEvent);
                      }}
                      className="ml-auto rounded-full p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </span>
                  )}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              {activeTab === 'weekly' && (
                <WeekCalendar selected={selectedDate} onSelect={handleSelect} />
              )}
              {activeTab === 'monthly' && (
                <MonthPicker selected={selectedDate} onSelect={handleSelect} />
              )}
              {activeTab === 'yearly' && (
                <YearPicker selected={selectedDate} onSelect={handleSelect} />
              )}
            </PopoverContent>
          </Popover>
        </>
      ) : null}
    </div>
  );
}
