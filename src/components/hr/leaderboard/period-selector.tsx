'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2 } from 'lucide-react';
import { getISOWeek, getISOWeekYear, subWeeks } from 'date-fns';
import {
  getISOWeeksInYear,
  buildPeriodLabel,
  getISOWeekDateRangeLabelShort,
} from '@/lib/utils/time-period-utils';
import { useGenerateRankingByPeriod } from '@/hooks/tanstack/mutations/hrMutations';
import type { RankLogPeriodType } from '@/types';

function getPreviousWeek(): { year: number; week: number } {
  const now = new Date();
  const nowYear = getISOWeekYear(now);
  const nowWeek = getISOWeek(now);
  if (nowWeek <= 1) {
    return { year: nowYear - 1, week: getISOWeeksInYear(nowYear - 1) };
  }
  return { year: nowYear, week: nowWeek - 1 };
}

/** Returns the ISO year and week for the week that was two weeks ago from today. */
function getTwoWeeksAgo(): { year: number; week: number } {
  const now = new Date();
  const twoWeeksAgoDate = subWeeks(now, 2);
  return {
    year: getISOWeekYear(twoWeeksAgoDate),
    week: getISOWeek(twoWeeksAgoDate),
  };
}

/** Previous week and two-weeks-ago for the weekly period dropdown. */
function getWeeklyPeriodOptions(): { year: number; week: number }[] {
  return [getPreviousWeek(), getTwoWeeksAgo()];
}

function getPreviousMonth(): { year: number; month: number } {
  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth1Based = now.getMonth() + 1;
  if (nowMonth1Based <= 1) {
    return { year: nowYear - 1, month: 12 };
  }
  return { year: nowYear, month: nowMonth1Based - 1 };
}

function getPreviousYear(): number {
  return new Date().getFullYear() - 1;
}

interface PeriodSelectorProps {
  currentType: RankLogPeriodType;
  currentYear: number;
  currentWeek: number;
  currentMonth: number;
  /** Whether the period we're currently viewing has a ranking (drives badge and buttons) */
  currentPeriodRankingExists: boolean;
}

function buildUrlForPeriod(type: RankLogPeriodType): string {
  const previousWeek = getPreviousWeek();
  const previousMonth = getPreviousMonth();
  const previousYear = getPreviousYear();
  const params = new URLSearchParams({ type, show: '1' });
  if (type === 'weekly') {
    params.set('year', String(previousWeek.year));
    params.set('week', String(previousWeek.week));
  } else if (type === 'monthly') {
    params.set('year', String(previousMonth.year));
    params.set('month', String(previousMonth.month));
  } else {
    params.set('year', String(previousYear));
  }
  return `/hr/leaderboard?${params.toString()}`;
}

function buildUrlForCurrentPeriod(
  type: RankLogPeriodType,
  year: number,
  week: number,
  month: number
): string {
  const params = new URLSearchParams({ type, show: '1' });
  if (type === 'weekly') {
    params.set('year', String(year));
    params.set('week', String(week));
  } else if (type === 'monthly') {
    params.set('year', String(year));
    params.set('month', String(month));
  } else {
    params.set('year', String(year));
  }
  return `/hr/leaderboard?${params.toString()}`;
}

function buildUrlForWeekly(year: number, week: number): string {
  const params = new URLSearchParams({
    type: 'weekly',
    show: '1',
    year: String(year),
    week: String(week),
  });
  return `/hr/leaderboard?${params.toString()}`;
}

export function PeriodSelector({
  currentType,
  currentYear,
  currentWeek,
  currentMonth,
  currentPeriodRankingExists,
}: PeriodSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticallyGenerated, setOptimisticallyGenerated] = useState(false);
  const generateRankingMutation = useGenerateRankingByPeriod();

  useEffect(() => {
    setOptimisticallyGenerated(false);
  }, [currentType, currentYear, currentWeek, currentMonth]);

  const periodLabel =
    currentType === 'monthly'
      ? buildPeriodLabel(currentType, currentYear, currentMonth)
      : currentType === 'yearly'
        ? buildPeriodLabel(currentType, currentYear)
        : `${buildPeriodLabel(currentType, currentYear, undefined, currentWeek)} (${getISOWeekDateRangeLabelShort(currentYear, currentWeek)})`;

  const periodFieldLabel =
    currentType === 'weekly' ? 'Week' : currentType === 'monthly' ? 'Month' : 'Year';

  const weeklyOptions = getWeeklyPeriodOptions();
  const currentWeeklyKey = `${currentYear}-${currentWeek}`;
  const weeklyOptionKeys = new Set(weeklyOptions.map((o) => `${o.year}-${o.week}`));
  const weeklySelectOptions = weeklyOptionKeys.has(currentWeeklyKey)
    ? weeklyOptions
    : [...weeklyOptions, { year: currentYear, week: currentWeek }];

  const handleWeeklyPeriodChange = (value: string) => {
    const [y, w] = value.split('-').map(Number);
    startTransition(() => {
      router.push(buildUrlForWeekly(y, w));
    });
  };

  const handlePeriodTypeChange = (value: string) => {
    const newType = value as RankLogPeriodType;
    startTransition(() => {
      router.push(buildUrlForPeriod(newType));
    });
  };

  const handleGenerateRank = () => {
    const targetUrl = buildUrlForCurrentPeriod(
      currentType,
      currentYear,
      currentWeek,
      currentMonth
    );

    startTransition(() => {
      router.push(targetUrl);
    });

    generateRankingMutation.mutate(
      {
        periodType: currentType,
        year: currentYear,
        month: currentType === 'monthly' ? currentMonth : undefined,
        week: currentType === 'weekly' ? currentWeek : undefined,
      },
      {
        onSuccess: () => {
          setOptimisticallyGenerated(true);
        },
        onError: () => {
          setOptimisticallyGenerated(false);
        },
      }
    );
  };

  const hasRanking = currentPeriodRankingExists || optimisticallyGenerated;
  const isGenerating = generateRankingMutation.isPending;

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      {/* Period Type */}
      <div className="flex w-full flex-col gap-1.5 sm:w-auto">
        <label className="text-xs font-medium text-muted-foreground">Period Type</label>
        <Select value={currentType} onValueChange={handlePeriodTypeChange}>
          <SelectTrigger className="w-full bg-white border-gray-300 text-foreground transition-all duration-200 hover:bg-[#E07C24] hover:text-white hover:border-[#E07C24] hover:shadow-md hover:[&_svg]:opacity-100 hover:[&_svg]:text-white sm:w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Period value: dropdown for weekly (two previous weeks), read-only for monthly/yearly */}
      <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:min-w-56">
        <label className="text-xs font-medium text-muted-foreground uppercase">
          {periodFieldLabel}
        </label>
        {currentType === 'weekly' ? (
          <Select value={currentWeeklyKey} onValueChange={handleWeeklyPeriodChange}>
            <SelectTrigger className="w-full bg-white border-gray-300 text-foreground transition-all duration-200 hover:bg-[#E07C24] hover:text-white hover:border-[#E07C24] hover:shadow-md hover:[&_svg]:opacity-100 hover:[&_svg]:text-white sm:min-w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {weeklySelectOptions.map(({ year: y, week: w }) => {
                const key = `${y}-${w}`;
                const label = `${buildPeriodLabel('weekly', y, undefined, w)} (${getISOWeekDateRangeLabelShort(y, w)})`;
                return (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex min-h-10 w-full items-center gap-2 rounded-md border border-gray-300 bg-muted/50 px-3 py-2 text-sm font-medium text-foreground sm:min-w-40 sm:w-auto">
            <span>{periodLabel}</span>
          </div>
        )}
      </div>

      {/* Show Rankings or "Already generated" indicator */}
      {hasRanking ? (
        <div className="flex w-full items-center self-start sm:w-auto sm:self-end">
          <div className="flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-800 sm:w-auto sm:justify-start">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Ranking already generated
          </div>
        </div>
      ) : (
        <Button
          onClick={handleGenerateRank}
          disabled={isPending || isGenerating}
          className="self-start min-h-10 w-full bg-primary-gradient text-white hover:opacity-95 sm:w-auto sm:self-end"
        >
          {isGenerating ? 'Generating…' : 'Generate Rank'}
        </Button>
      )}
    </div>
  );
}
