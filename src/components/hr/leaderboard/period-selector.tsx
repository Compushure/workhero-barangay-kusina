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
import { cn } from '@/lib/utils';
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
  className?: string;
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
  className,
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
    const targetUrl = buildUrlForCurrentPeriod(currentType, currentYear, currentWeek, currentMonth);

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
        onSuccess: (data) => {
          if (data && data.length > 0) {
            setOptimisticallyGenerated(true);
          } else {
            setOptimisticallyGenerated(false);
          }
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
    <div className={cn('manager-sticky-controls w-full rounded-2xl p-3 sm:p-3.5', className)}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[240px_minmax(0,1fr)_auto]">
        {/* Period Type */}
        <div className="flex w-full flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Period Type
          </span>
          <Select value={currentType} onValueChange={handlePeriodTypeChange}>
            <SelectTrigger className="control-h w-full rounded-lg border border-border bg-card px-3.5 text-xs font-medium text-primary shadow-sm sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Period value */}
        <div className="flex w-full flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {periodFieldLabel}
          </span>
          {currentType === 'weekly' ? (
            <Select value={currentWeeklyKey} onValueChange={handleWeeklyPeriodChange}>
              <SelectTrigger className="control-h w-full rounded-lg border border-border bg-card px-3.5 text-xs font-medium text-primary shadow-sm sm:text-sm">
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
            <div className="control-h inline-flex items-center rounded-full border border-dashed border-accent/40 bg-background/60 px-3.5 text-xs font-semibold text-foreground sm:text-sm">
              <span>{periodLabel}</span>
            </div>
          )}
        </div>

        {/* Status / Action */}
        <div className="flex w-full items-center self-start">
          {hasRanking ? (
            <div className="control-h inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-700 sm:text-sm lg:w-auto">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              Ranking ready
            </div>
          ) : (
            <Button
              onClick={handleGenerateRank}
              disabled={isPending || isGenerating}
              className="control-h w-full rounded-full bg-primary-gradient px-5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 sm:text-sm lg:w-auto"
            >
              {isGenerating ? 'Generating…' : 'Generate Rank'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
