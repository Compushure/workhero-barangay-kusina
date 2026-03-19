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
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import {
  getISOWeeksInYear,
  buildPeriodLabel,
  getISOWeekDateRangeLabelShort,
} from '@/lib/utils/time-period-utils';
import { useGenerateRankingByPeriod } from '@/hooks/tanstack/mutations/hrMutations';
import { cn } from '@/lib/utils';
import VisibilityToggle from '@/components/hr/leaderboard/visibility-toggle';
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

function getWeeklyPeriodOptions(): { year: number; week: number }[] {
  return [getPreviousWeek()];
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
  rankingPeriodId?: string;
  isVisible?: boolean;
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
  rankingPeriodId,
  isVisible,
  className,
}: PeriodSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticallyGenerated, setOptimisticallyGenerated] = useState(false);
  const generateRankingMutation = useGenerateRankingByPeriod();
  const latestWeek = getPreviousWeek();
  const latestMonth = getPreviousMonth();
  const latestYear = getPreviousYear();

  useEffect(() => {
    setOptimisticallyGenerated(false);
  }, [currentType, currentYear, currentWeek, currentMonth]);

  const periodLabel =
    currentType === 'monthly'
      ? buildPeriodLabel(currentType, currentYear, currentMonth)
      : currentType === 'yearly'
        ? buildPeriodLabel(currentType, currentYear)
        : getISOWeekDateRangeLabelShort(currentYear, currentWeek);

  const periodFieldLabel =
    currentType === 'weekly' ? 'Week' : currentType === 'monthly' ? 'Month' : 'Year';

  const weeklyOptions = getWeeklyPeriodOptions();
  const currentWeeklyKey = `${currentYear}-${currentWeek}`;
  const weeklyOptionKeys = new Set(weeklyOptions.map((o) => `${o.year}-${o.week}`));
  const weeklySelectOptions = weeklyOptionKeys.has(currentWeeklyKey)
    ? weeklyOptions
    : [...weeklyOptions, { year: currentYear, week: currentWeek }];
  const isLatestSelected =
    currentType === 'weekly'
      ? currentYear === latestWeek.year && currentWeek === latestWeek.week
      : currentType === 'monthly'
        ? currentYear === latestMonth.year && currentMonth === latestMonth.month
        : currentYear === latestYear;
  const latestPeriodLabel =
    currentType === 'weekly'
      ? getISOWeekDateRangeLabelShort(latestWeek.year, latestWeek.week)
      : currentType === 'monthly'
        ? buildPeriodLabel('monthly', latestMonth.year, latestMonth.month)
        : buildPeriodLabel('yearly', latestYear);
  const hasRanking = currentPeriodRankingExists || optimisticallyGenerated;
  const isGenerating = generateRankingMutation.isPending;
  const isGenerateDisabled = hasRanking || isPending || isGenerating || !isLatestSelected;
  const generateStatus = hasRanking
    ? {
        icon: CheckCircle2,
        text: 'Already generated',
        tone: 'text-emerald-600',
        textClassName: 'text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground',
      }
    : isLatestSelected
      ? {
          icon: AlertCircle,
          text: 'Generation available',
          tone: 'text-amber-600',
          textClassName: 'text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground',
        }
      : {
          icon: AlertCircle,
          text: 'Generation unavailable',
          tone: 'text-muted-foreground',
          textClassName: 'text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground',
        };

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

  const GenerateStatusIcon = generateStatus.icon;

  return (
    <div className={cn('manager-sticky-controls !mx-0 w-full rounded-2xl p-3 sm:p-3.5', className)}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[240px_minmax(0,1fr)_auto] xl:grid-cols-[130px_210px_auto]">
        {/* Period Type */}
        <div className="flex w-full flex-col gap-1.5 xl:max-w-[130px]">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Period Type
          </span>
          <Select value={currentType} onValueChange={handlePeriodTypeChange}>
            <SelectTrigger className="control-h w-full cursor-pointer rounded-lg border border-border bg-card px-3.5 text-xs font-semibold text-primary shadow-sm sm:text-sm">
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
        <div className="flex w-full flex-col gap-1.5 xl:max-w-[210px]">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {periodFieldLabel}
          </span>
          {currentType === 'weekly' ? (
            <Select value={currentWeeklyKey} onValueChange={handleWeeklyPeriodChange}>
              <SelectTrigger className="control-h w-full cursor-pointer rounded-lg border border-border bg-card px-3.5 text-xs font-semibold text-primary shadow-sm sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {weeklySelectOptions.map(({ year: y, week: w }) => {
                  const key = `${y}-${w}`;
                  const label = getISOWeekDateRangeLabelShort(y, w);
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
        <div className="flex w-full flex-col gap-1.5 self-start">
          <div className="grid w-full gap-2 sm:grid-cols-2 xl:grid-cols-[172px_172px]">
            <div className="flex w-full flex-col items-start gap-1.5 xl:max-w-[172px]">
              <div className="flex min-h-4 items-center gap-1.5">
                <GenerateStatusIcon className={cn('h-3.5 w-3.5 shrink-0', generateStatus.tone)} />
                <span className={generateStatus.textClassName}>
                  {generateStatus.text}
                </span>
              </div>
              <Button
                onClick={handleGenerateRank}
                disabled={isGenerateDisabled}
                className="control-h w-full rounded-full bg-primary-gradient px-4 text-xs font-semibold text-white shadow-sm transition hover:cursor-pointer hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:opacity-60 sm:text-sm"
              >
                {isGenerating ? 'Generating...' : 'Generate Rank'}
              </Button>
            </div>

            {hasRanking && rankingPeriodId && typeof isVisible === 'boolean' ? (
              <VisibilityToggle
                rankingPeriodId={rankingPeriodId}
                isVisible={isVisible}
                disabled={rankingPeriodId.startsWith('optimistic-')}
                className="w-full xl:max-w-[172px]"
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
