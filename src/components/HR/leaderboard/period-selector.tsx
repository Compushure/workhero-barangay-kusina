'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getISOWeek } from 'date-fns';
import { getISOWeeksInYear, getISOWeekDateRangeLabel } from '@/lib/utils/time-period-utils';
import type { RankLogPeriodType } from '@/types';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const RANKING_START_YEAR = 2025;

interface PeriodSelectorProps {
  currentType: RankLogPeriodType;
  currentYear: number;
  currentWeek: number;
  currentMonth: number;
}

export function PeriodSelector({
  currentType,
  currentYear,
  currentWeek,
  currentMonth,
}: PeriodSelectorProps) {
  const router = useRouter();

  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1;
  const nowISOWeek = getISOWeek(now);

  const endYear = Math.max(RANKING_START_YEAR, nowYear);
  const yearOptions = Array.from(
    { length: endYear - RANKING_START_YEAR + 1 },
    (_, i) => RANKING_START_YEAR + i
  );

  const [periodType, setPeriodType] = useState<RankLogPeriodType>(currentType);
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [week, setWeek] = useState(currentWeek);

  const isoWeeksInYear = getISOWeeksInYear(year);

  const maxMonth = year < nowYear ? 12 : Math.max(1, nowMonth - 1);
  const maxWeek = year < nowYear ? isoWeeksInYear : Math.max(1, nowISOWeek - 1);

  const monthOptions = MONTHS.slice(0, maxMonth).map((name, idx) => ({ value: idx + 1, name }));
  const weekOptions = Array.from({ length: maxWeek }, (_, i) => i + 1);

  const handlePeriodTypeChange = (value: string) => {
    setPeriodType(value as RankLogPeriodType);
  };

  const handleYearChange = (value: string) => {
    const newYear = Number(value);
    setYear(newYear);
    const newMaxW = newYear < nowYear ? getISOWeeksInYear(newYear) : Math.max(1, nowISOWeek - 1);
    const newMaxM = newYear < nowYear ? 12 : Math.max(1, nowMonth - 1);
    setWeek((w) => Math.min(w, newMaxW));
    setMonth((m) => Math.min(m, newMaxM));
  };

  const handleShowRankings = () => {
    const params = new URLSearchParams();
    params.set('type', periodType);
    params.set('year', String(year));
    if (periodType === 'monthly') params.set('month', String(month));
    if (periodType === 'weekly') params.set('week', String(week));
    params.set('show', '1');
    router.push(`/hr/leaderboard?${params.toString()}`);
  };

  return (
    <div className="flex w-full flex-wrap items-end gap-3">
      {/* Period Type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Period Type</label>
        <Select value={periodType} onValueChange={handlePeriodTypeChange}>
          <SelectTrigger className="w-25 bg-white border-gray-300 text-foreground transition-all duration-200  hover:bg-[#E07C24] hover:text-white hover:border-[#E07C24] hover:shadow-md hover:[&_svg]:opacity-100 hover:[&_svg]:text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Week (weekly only) */}
      {periodType === 'weekly' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Week</label>
          <Select value={String(Math.min(week, maxWeek))} onValueChange={(v) => setWeek(Number(v))}>
            <SelectTrigger className="min-w-[235px] bg-white border-gray-300 text-foreground transition-all duration-200 hover:bg-[#E07C24] hover:text-white hover:border-[#E07C24] hover:shadow-md hover:[&_svg]:opacity-100 hover:[&_svg]:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {weekOptions.map((w) => (
                <SelectItem key={w} value={String(w)}>
                  Week {w} ({getISOWeekDateRangeLabel(year, w)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Month (monthly only) */}
      {periodType === 'monthly' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Month</label>
          <Select
            value={String(Math.min(month, maxMonth))}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger className="w-25 bg-white border-gray-300 text-foreground transition-all duration-200 hover:bg-[#E07C24] hover:text-white hover:border-[#E07C24] hover:shadow-md hover:[&_svg]:opacity-100 hover:[&_svg]:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(({ value, name }) => (
                <SelectItem key={value} value={String(value)}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Year */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Year</label>
        <Select value={String(year)} onValueChange={handleYearChange}>
          <SelectTrigger className="w-25 bg-white border-gray-300 text-foreground transition-all duration-200  hover:bg-[#E07C24] hover:text-white hover:border-[#E07C24] hover:shadow-md hover:[&_svg]:opacity-100 hover:[&_svg]:text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Show Rankings Button */}
      <Button
        onClick={handleShowRankings}
        className="bg-primary-gradient text-white hover:opacity-95 self-end"
      >
        Show Rankings
      </Button>
    </div>
  );
}
