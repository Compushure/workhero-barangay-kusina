'use client';

import { Trophy } from 'lucide-react';
import type { EmployeeRank } from '@/types';

interface RankWidgetProps {
  rankData: EmployeeRank | null;
  isLoading?: boolean;
  isCollapsed?: boolean;
  totalXP?: number;
}

/**
 * Rank Widget Component
 * Displays employee's rank among all regular employees
 * Responsive to sidebar collapsed state
 */
export function RankWidget({ rankData, isLoading, isCollapsed, totalXP }: RankWidgetProps) {
  // Loading state
  if (isLoading) {
    if (isCollapsed) {
      return (
        <div className="bg-white/10 rounded-lg h-16 w-16 mx-auto flex items-center justify-center mb-4">
          <div className="animate-pulse">
            <Trophy size={20} className="text-white/30" />
          </div>
        </div>
      );
    }

    // Expanded loading state with skeleton
    return (
      <div className="bg-white/10 rounded-lg p-4 mb-4 animate-pulse">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 rounded-full p-2 shrink-0">
            <Trophy size={20} className="text-white/30" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="h-7 w-12 bg-white/20 rounded"></div>
            <div className="h-3 w-10 bg-white/20 rounded"></div>
          </div>
        </div>
        <div className="h-3 w-full bg-white/20 rounded"></div>
      </div>
    );
  }

  if (!rankData) {
    return null;
  }

  const { rank } = rankData;

  if (isCollapsed) {
    // Collapsed state: compact view with just rank number
    return (
      <div
        className="bg-white/10 rounded-lg h-16 w-16 mx-auto flex flex-col items-center justify-center mb-4"
        title={`Personal Rank #${rank} - ${totalXP || 0} Total XP`}
      >
        <Trophy size={16} className="text-yellow-300 mb-1" />
        <span className="text-xs font-bold text-white">#{rank}</span>
      </div>
    );
  }

  // Expanded state: full card with details
  return (
    <div className="bg-white/10 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-white/20 rounded-full p-2 shrink-0">
          <Trophy size={20} className="text-yellow-300" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">#{rank}</span>
          <span className="text-xl text-red-200">Rank</span>
        </div>
      </div>
      <p className="text-xs text-red-200">
        Total Points and XP earned: <span className="text-white font-semibold">{totalXP || 0}</span>
      </p>
    </div>
  );
}
