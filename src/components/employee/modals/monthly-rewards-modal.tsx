'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RewardCard } from '@/components/employee/mercado/reward-card';
import { Package, Sparkles } from 'lucide-react';
import type { Reward } from '@/types';

interface MonthlyRewardsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: number | null;
  rewards: Reward[];
  userPoints: number;
  pendingRewardIds: Set<string>;
}

const MONTH_NAMES = [
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
];

const MONTH_EMOJIS = [
  '❄️', // January - Winter
  '💖', // February - Valentine
  '🌸', // March - Spring
  '🌷', // April - Flowers
  '🌺', // May - Blooming
  '☀️', // June - Summer
  '🏖️', // July - Beach
  '🌻', // August - Sunflower
  '🍂', // September - Autumn
  '🎃', // October - Halloween
  '🍁', // November - Fall
  '🎄', // December - Christmas
];

export function MonthlyRewardsModal({
  open,
  onOpenChange,
  month,
  rewards,
  userPoints,
  pendingRewardIds,
}: MonthlyRewardsModalProps) {
  const monthName = month ? MONTH_NAMES[month - 1] : '';
  const monthEmoji = month ? MONTH_EMOJIS[month - 1] : '🏪';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] p-0 bg-[#fff8f5]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b-2 border-[#690003]/20 bg-linear-to-r from-[#fef5f1] to-[#fff8f5]">
          <DialogTitle className="text-2xl font-bold text-[#690003] flex items-center gap-3">
            <div className="relative">
              <Package className="h-7 w-7 text-[#690003]" />
              <Sparkles className="h-3 w-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="pixelated-text">
              {monthEmoji} {monthName} Market
            </span>
          </DialogTitle>
          <DialogDescription className="text-[#7a3d3d] font-medium">
            {rewards.length > 0 ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {rewards.length} special {rewards.length === 1 ? 'treasure' : 'treasures'} available
                this month!
              </span>
            ) : (
              `No treasures unlocked for ${monthName} yet... Check back soon! 🔒`
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-120px)]">
          {rewards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
              <div className="relative mb-4">
                <Package className="h-16 w-16 text-gray-300" />
                <span className="absolute -top-2 -right-2 text-3xl">🔒</span>
              </div>
              <p className="text-[#5a2a2a] text-lg font-semibold mb-2">Empty Stall!</p>
              <p className="text-[#7a3d3d] text-sm">
                No rewards available for {monthName} yet. <br />
                Try another stall or come back later! 🏪
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-6">
              {rewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  userPoints={userPoints}
                  hasPendingRequest={pendingRewardIds.has(reward.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
