"use client";

import { UserWithExtras } from '@/types';

interface StatItem {
  label: string;
  value: string | number;
  hint?: string;
}

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'number' && Number.isFinite(value)) return value.toLocaleString();
  return String(value);
};

export function GamifiedStats({ profile }: { profile: UserWithExtras }) {
  const stats: StatItem[] = [
    {
      label: 'Total XP',
      value: formatValue(profile.total_xp),
    },
    {
      label: 'Points',
      value: formatValue(profile.points),
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-border bg-background-soft px-4 py-3 shadow-sm"
        >
          <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
          <p className="text-xl font-semibold text-title leading-snug">{stat.value}</p>
          {stat.hint && (
            <p className="text-[11px] text-muted-foreground mt-1">{stat.hint}</p>
          )}
        </div>
      ))}
    </div>
  );
}
