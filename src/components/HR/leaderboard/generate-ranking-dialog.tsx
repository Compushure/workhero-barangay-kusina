'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getISOWeek } from 'date-fns';
import { generateRanking } from '@/actions/hr/leaderboard';
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

interface GenerateRankingDialogProps {
  defaultPeriodType: RankLogPeriodType;
}

export default function GenerateRankingDialog({ defaultPeriodType }: GenerateRankingDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1–12
  const currentISOWeek = getISOWeek(now);

  // Years from 2025 through current year (all past years since 2025 + current)
  const RANKING_START_YEAR = 2025;
  const endYear = Math.max(RANKING_START_YEAR, currentYear);
  const yearOptions = Array.from(
    { length: endYear - RANKING_START_YEAR + 1 },
    (_, i) => RANKING_START_YEAR + i
  );
  const defaultYear = Math.max(RANKING_START_YEAR, Math.min(currentYear, endYear));

  const [periodType, setPeriodType] = useState<RankLogPeriodType>(defaultPeriodType);
  const [year, setYear] = useState(defaultYear);
  // Default to last completed period (past only): current month/week excluded
  const lastCompletedMonth = Math.max(1, currentMonth - 1);
  const lastCompletedWeek = Math.max(1, currentISOWeek - 1);
  const [month, setMonth] = useState(lastCompletedMonth);
  const [week, setWeek] = useState(lastCompletedWeek);

  const isoWeeksInYear = getISOWeeksInYear(year);

  // For selected year: only past (completed) months — exclude current month for current year
  const maxMonth = year < currentYear ? 12 : Math.max(0, currentMonth - 1);
  const monthOptions =
    maxMonth > 0 ? MONTHS.slice(0, maxMonth).map((name, idx) => ({ value: idx + 1, name })) : [];

  // For selected year: only past (completed) weeks — exclude current week for current year
  const maxWeek = year < currentYear ? isoWeeksInYear : Math.max(0, currentISOWeek - 1);
  const weekOptions = Array.from({ length: maxWeek }, (_, i) => i + 1);

  const canGenerate =
    periodType === 'yearly' ||
    (periodType === 'weekly' && maxWeek > 0) ||
    (periodType === 'monthly' && maxMonth > 0);

  const handleGenerate = () => {
    if (!canGenerate) return;
    startTransition(async () => {
      const safeMonth = periodType === 'monthly' ? Math.min(month, maxMonth || 1) : undefined;
      const safeWeek = periodType === 'weekly' ? Math.min(week, maxWeek || 1) : undefined;
      const result = await generateRanking(periodType, year, safeMonth, safeWeek);

      if (result.success) {
        toast.success(`Ranking generated for "${result.data.period_label}"`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#6D1616] hover:bg-[#5a1212] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Generate Ranking
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#6D1616]">Generate Ranking</DialogTitle>
          <DialogDescription>
            Select a period to generate a ranking. At least 1 employee with scores is required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Period Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Period Type</label>
            <Select value={periodType} onValueChange={(v) => setPeriodType(v as RankLogPeriodType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Year */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Year</label>
            <Select
              value={String(year)}
              onValueChange={(v) => {
                const newYear = Number(v);
                setYear(newYear);
                const maxW =
                  newYear < currentYear
                    ? getISOWeeksInYear(newYear)
                    : Math.max(0, currentISOWeek - 1);
                const maxM = newYear < currentYear ? 12 : Math.max(0, currentMonth - 1);
                if (periodType === 'weekly') setWeek((w) => (maxW > 0 ? Math.min(w, maxW) : 1));
                if (periodType === 'monthly') setMonth((m) => (maxM > 0 ? Math.min(m, maxM) : 1));
              }}
            >
              <SelectTrigger className="w-full">
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

          {/* Month (for monthly only; weekly uses ISO week) */}
          {periodType === 'monthly' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Month</label>
              <Select
                value={maxMonth > 0 ? String(Math.min(month, maxMonth)) : ''}
                onValueChange={(v) => setMonth(Number(v))}
              >
                <SelectTrigger className="w-full" disabled={maxMonth === 0}>
                  <SelectValue
                    placeholder={maxMonth === 0 ? 'No completed months yet' : undefined}
                  />
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

          {/* Week (for weekly only: ISO week 1–52/53 with date range) */}
          {periodType === 'weekly' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Week</label>
              <Select
                value={maxWeek > 0 ? String(Math.min(week, maxWeek)) : ''}
                onValueChange={(v) => setWeek(Number(v))}
              >
                <SelectTrigger className="w-full" disabled={maxWeek === 0}>
                  <SelectValue placeholder={maxWeek === 0 ? 'No completed weeks yet' : undefined} />
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isPending || !canGenerate}
            className="bg-[#6D1616] hover:bg-[#5a1212] text-white"
          >
            {isPending ? 'Generating...' : 'Generate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
