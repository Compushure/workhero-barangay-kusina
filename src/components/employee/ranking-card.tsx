'use client';

import { Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { RankingInfo } from './types';

interface RankingCardProps {
  ranking: RankingInfo;
}

/**
 * RankingCard - Client Component
 * Displays personal ranking information
 */
export function RankingCard({ ranking }: RankingCardProps) {
  return (
    <Card className="bg-linear-to-b from-amber-100 to-amber-50 p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
          <Trophy className="h-4 w-4" />
          Personal Kuisiner Ranking
        </div>
        <p className="text-xs text-amber-700">{ranking.period}</p>
        <div className="text-center">
          <div className="text-4xl font-bold text-red-600">#{ranking.rank}</div>
        </div>
        <div className="space-y-2 border-t border-amber-200 pt-3 text-xs">
          <div className="flex justify-between">
            <span className="text-amber-700">Total Fiestas Earned:</span>
            <span className="font-bold text-amber-900">{ranking.totalFiestasEarned}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-700">Total XP Earned:</span>
            <span className="font-bold text-amber-900">{ranking.totalXpEarned}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
