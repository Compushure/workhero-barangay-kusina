'use client';

import React, { useState } from 'react';
import { getDay, isSameISOWeek, startOfISOWeek, endOfISOWeek } from 'date-fns';
import { type DayButton } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  MONTH_NAMES_SHORT,
  YEAR_RANGE_SIZE,
  getYearRangeStart,
} from '@/lib/utils/period-filter-utils';

export type PeriodDatePickerVariant = 'employee' | 'default';

interface MonthPickerProps {
  selected: Date | null;
  onSelect: (date: Date) => void;
  variant?: PeriodDatePickerVariant;
  isDateSelectable?: (date: Date) => boolean;
}

export function MonthPicker({
  selected,
  onSelect,
  variant = 'default',
  isDateSelectable,
}: MonthPickerProps) {
  const [year, setYear] = useState(() => selected?.getFullYear() ?? new Date().getFullYear());
  const isEmployee = variant === 'employee';

  return (
    <div className={cn('p-3', isEmployee ? 'w-56' : 'w-64')}>
      <div className="flex items-center justify-between mb-4">
        {isEmployee ? (
          <>
            <button
              type="button"
              onClick={() => setYear((y) => y - 1)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-white/60 hover:bg-[#b07440]/40 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-jersey text-sm tracking-widest text-[#F4B925]">{year}</span>
            <button
              type="button"
              onClick={() => setYear((y) => y + 1)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-white/60 hover:bg-[#b07440]/40 hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setYear((y) => y - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold">{year}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setYear((y) => y + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1">
        {MONTH_NAMES_SHORT.map((name, idx) => {
          const monthDate = new Date(year, idx, 1);
          const isDisabled = isDateSelectable ? !isDateSelectable(monthDate) : false;
          const isSelected =
            selected !== null &&
            selected.getFullYear() === year &&
            selected.getMonth() === idx;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onSelect(monthDate)}
              disabled={isDisabled}
              className={cn(
                'cursor-pointer rounded-md py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                isEmployee && 'font-jersey tracking-widest',
                isEmployee
                  ? isSelected
                    ? 'bg-[#F4B925] text-[#3D2512]'
                    : 'text-white/80 hover:bg-[#b07440]/40 hover:text-white'
                  : cn(
                      'font-medium hover:bg-accent hover:text-accent-foreground',
                      isSelected &&
                        'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                    )
              )}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface YearPickerProps {
  selected: Date | null;
  onSelect: (date: Date) => void;
  variant?: PeriodDatePickerVariant;
  isDateSelectable?: (date: Date) => boolean;
}

export function YearPicker({
  selected,
  onSelect,
  variant = 'default',
  isDateSelectable,
}: YearPickerProps) {
  const [rangeStart, setRangeStart] = useState(() =>
    getYearRangeStart(selected?.getFullYear() ?? new Date().getFullYear())
  );
  const years = Array.from({ length: YEAR_RANGE_SIZE }, (_, i) => rangeStart + i);
  const isEmployee = variant === 'employee';

  return (
    <div className={cn('p-3', isEmployee ? 'w-56' : 'w-64')}>
      <div className="flex items-center justify-between mb-4">
        {isEmployee ? (
          <>
            <button
              type="button"
              onClick={() => setRangeStart((s) => s - YEAR_RANGE_SIZE)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-white/60 hover:bg-[#b07440]/40 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-jersey text-sm tracking-widest text-[#F4B925]">
              {rangeStart} – {rangeStart + YEAR_RANGE_SIZE - 1}
            </span>
            <button
              type="button"
              onClick={() => setRangeStart((s) => s + YEAR_RANGE_SIZE)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-white/60 hover:bg-[#b07440]/40 hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setRangeStart((s) => s - YEAR_RANGE_SIZE)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold">
              {rangeStart} – {rangeStart + YEAR_RANGE_SIZE - 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setRangeStart((s) => s + YEAR_RANGE_SIZE)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1">
        {years.map((yr) => {
          const yearDate = new Date(yr, 0, 1);
          const isDisabled = isDateSelectable ? !isDateSelectable(yearDate) : false;
          const isSelected = selected !== null && selected.getFullYear() === yr;
          return (
            <button
              key={yr}
              type="button"
              onClick={() => onSelect(yearDate)}
              disabled={isDisabled}
              className={cn(
                'cursor-pointer rounded-md py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                isEmployee && 'font-jersey tracking-widest',
                isEmployee
                  ? isSelected
                    ? 'bg-[#F4B925] text-[#3D2512]'
                    : 'text-white/80 hover:bg-[#b07440]/40 hover:text-white'
                  : cn(
                      'font-medium hover:bg-accent hover:text-accent-foreground',
                      isSelected &&
                        'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                    )
              )}
            >
              {yr}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const WeekHoverContext = React.createContext<Date | null>(null);
const WeekVariantContext = React.createContext<PeriodDatePickerVariant>('default');

function WeekDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const hoveredDate = React.useContext(WeekHoverContext);
  const variant = React.useContext(WeekVariantContext);
  const ref = React.useRef<HTMLButtonElement>(null);
  const isEmployee = variant === 'employee';

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const isInHoveredWeek = hoveredDate !== null && isSameISOWeek(day.date, hoveredDate);
  const dow = getDay(day.date);
  const isHoveredStart = isInHoveredWeek && dow === 1;
  const isHoveredEnd = isInHoveredWeek && dow === 0;
  const isRangeSelected = modifiers.range_start || modifiers.range_end || modifiers.range_middle;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'flex aspect-square size-auto w-full min-w-(--cell-size) cursor-pointer flex-col gap-1 leading-none font-normal disabled:cursor-not-allowed',
        '[&>span]:text-xs [&>span]:opacity-70',
        isEmployee && 'font-jersey text-white/80',
        isEmployee
          ? cn(
              !isInHoveredWeek && 'hover:bg-[#3D2512]/80 hover:text-white',
              'data-[selected-single=true]:bg-[#F4B925] data-[selected-single=true]:text-[#3D2512]',
              'data-[range-start=true]:bg-[#F4B925] data-[range-start=true]:text-[#3D2512] data-[range-start=true]:rounded-l-md data-[range-start=true]:rounded-r-none',
              'data-[range-middle=true]:bg-[#3D2512]/90 data-[range-middle=true]:text-white data-[range-middle=true]:rounded-none',
              'data-[range-end=true]:bg-[#F4B925] data-[range-end=true]:text-[#3D2512] data-[range-end=true]:rounded-r-md data-[range-end=true]:rounded-l-none',
              isInHoveredWeek && !isRangeSelected && 'bg-[#3D2512]/80 text-white',
              isInHoveredWeek && !isRangeSelected && !isHoveredStart && !isHoveredEnd && 'rounded-none',
              isHoveredStart && !isRangeSelected && 'rounded-l-md rounded-r-none',
              isHoveredEnd && !isRangeSelected && 'rounded-r-md rounded-l-none',
              'hover:bg-[#3D2512]/80! hover:text-white!'
            )
          : cn(
              !isInHoveredWeek && 'hover:bg-accent hover:text-accent-foreground',
              'data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground',
              'data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-start=true]:rounded-l-md data-[range-start=true]:rounded-r-none',
              'data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-middle=true]:rounded-none',
              'data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-end=true]:rounded-r-md data-[range-end=true]:rounded-l-none',
              isInHoveredWeek && !isRangeSelected && 'bg-accent text-accent-foreground',
              isInHoveredWeek && !isRangeSelected && !isHoveredStart && !isHoveredEnd && 'rounded-none',
              isHoveredStart && !isRangeSelected && 'rounded-l-md rounded-r-none',
              isHoveredEnd && !isRangeSelected && 'rounded-r-md rounded-l-none'
            ),
        className
      )}
      {...props}
    />
  );
}

interface WeekCalendarProps {
  selected: Date | null;
  onSelect: (date: Date) => void;
  variant?: PeriodDatePickerVariant;
  isDateSelectable?: (date: Date) => boolean;
}

export function WeekCalendar({
  selected,
  onSelect,
  variant = 'default',
  isDateSelectable,
}: WeekCalendarProps) {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const isEmployee = variant === 'employee';

  const selectedRange =
    selected !== null
      ? { from: startOfISOWeek(selected), to: endOfISOWeek(selected) }
      : undefined;

  return (
    <WeekHoverContext.Provider value={hoveredDate}>
      <WeekVariantContext.Provider value={variant}>
        <Calendar
          mode="range"
          selected={selectedRange}
          onDayMouseEnter={(day) => setHoveredDate(day)}
          onDayMouseLeave={() => setHoveredDate(null)}
          onDayClick={(day) => onSelect(day)}
          disabled={isDateSelectable ? (date) => !isDateSelectable(date) : undefined}
          weekStartsOn={1}
          components={{ DayButton: WeekDayButton }}
        classNames={
          isEmployee
            ? {
                today: '',
                caption_label:
                  'select-none font-jersey tracking-widest text-[#F4B925] text-sm font-medium',
                weekday:
                  'font-jersey text-white/40 rounded-md flex-1 font-normal text-[0.8rem] select-none',
                outside: 'text-white/20 aria-selected:text-white/20',
                disabled: 'text-white/20 opacity-50',
                button_previous:
                  'inline-flex cursor-pointer items-center justify-center rounded-md size-(--cell-size) aria-disabled:opacity-50 p-0 select-none text-[#F4B925] hover:bg-[#3D2512]/80 hover:text-[#F4B925] [&_svg]:text-[#F4B925] [&_svg]:size-4',
                button_next:
                  'inline-flex cursor-pointer items-center justify-center rounded-md size-(--cell-size) aria-disabled:opacity-50 p-0 select-none text-[#F4B925] hover:bg-[#3D2512]/80 hover:text-[#F4B925] [&_svg]:text-[#F4B925] [&_svg]:size-4',
              }
            : { today: '' }
        }
        className="p-3"
        />
      </WeekVariantContext.Provider>
    </WeekHoverContext.Provider>
  );
}
