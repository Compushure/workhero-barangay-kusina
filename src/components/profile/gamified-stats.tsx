"use client";

import { UserWithExtras } from '@/types';

interface StatItem {
  label: string;
  value: string | number;
  hint?: string;
}

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '0';
  if (typeof value === 'number' && Number.isFinite(value)) return value.toLocaleString();
  return String(value);
};

export function GamifiedStats({ profile }: { profile: UserWithExtras }) {
  const stats: StatItem[] = [
    {
      label: 'XP',
      value: formatValue(profile.xp),
    },
    {
      label: 'Total XP',
      value: formatValue(profile.total_xp),
    },
    {
      label: 'Points',
      value: formatValue(profile.points),
    },
    {
      label: 'Total Points',
      value: formatValue(profile.total_points_earned),
    },
    {
      label: 'Level',
      value: formatValue(profile.user_level ?? profile.level),
    },
    {
      label: 'Performance Score',
      value: formatValue(profile.performance_score),
    },
    {
      label: 'Total Absences',
      value: formatValue(profile.total_absences),
    },
    {
      label: 'Total Lates',
      value: formatValue(profile.total_lates),
    },
    {
      label: 'Total Undertimes',
      value: formatValue(profile.total_undertimes),
    },
    {
      label: 'Total Overtimes',
      value: formatValue(profile.total_overtimes),
    },
  ];

  return (
    <div className="grid h-full content-start grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 md:gap-4 xl:grid-cols-3 w-full max-w-full">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-border bg-background-soft px-2.5 py-2.5 sm:px-3 sm:py-3 md:px-4 shadow-sm min-w-0 max-w-full"
        >
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground wrap-break-word">{stat.label}</p>
          <p className="text-base sm:text-lg md:text-xl font-semibold text-title leading-snug wrap-break-word">{stat.value}</p>
          {stat.hint && (
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1">{stat.hint}</p>
          )}
        </div>
      ))}
    </div>
  );
}
