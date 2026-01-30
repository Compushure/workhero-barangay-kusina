'use client';

import { Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { EmployeeStats } from './types';

interface StatsBarProps {
  stats: EmployeeStats;
}

/**
 * StatsBar - Client Component
 * Displays coins, level, and XP progress in the dashboard header
 */
export function StatsBar({ stats }: StatsBarProps) {
  const xpPercentage = (stats.xp.current / stats.xp.total) * 100;

  return (
    <div className="grid grid-cols-3 items-center gap-8">
      {/* Left Column: Coins Counter */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-base font-bold text-amber-900">
            1
          </div>
          <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-amber-200 bg-amber-400 text-xs font-bold text-amber-900">
            1
          </div>
        </div>
        <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900">
          {stats.coins.toLocaleString()}
        </span>
      </div>

      {/* Center Column: Level & XP Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-red-500 bg-amber-100 text-xl font-bold text-red-600">
            {stats.level}
          </div>
          <Progress value={xpPercentage} className="h-3 flex-1 bg-red-200" />
        </div>
        <span className="text-xs font-medium text-gray-600">
          {stats.xp.current}/{stats.xp.total} XP
        </span>
      </div>

      {/* Right Column: Profile Icon Placeholder */}
      <div className="flex justify-end">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-gray-300 bg-gray-200">
          <Zap className="h-6 w-6 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
