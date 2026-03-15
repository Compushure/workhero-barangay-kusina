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
    <div className="rounded-xl border border-gray-200 bg-white inline-flex items-stretch overflow-hidden self-start">
      {/* TYPE column */}
      <div className="flex flex-col gap-0.5 px-4 py-3 min-w-[110px]">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Select Period
        </span>
        <Select value={activeTab} onValueChange={onTypeChange}>
          <SelectTrigger className="border-0 shadow-none p-0 h-auto gap-1.5 text-sm font-normal text-foreground focus:ring-0 bg-transparent [&>svg]:text-foreground [&>svg]:opacity-70">
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
          <div className="w-px bg-gray-200 self-stretch" />
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex flex-col gap-0.5 px-4 py-3 text-left hover:bg-gray-50 transition-colors group min-w-[160px]"
              >
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Filter by {TAB_LABELS[activeTab]}
                </span>
                <span className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 shrink-0 text-primary" />
                  <span
                    className={cn('text-sm font-normal', !hasSelection && 'text-muted-foreground')}
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
                      className="ml-auto rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted"
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
