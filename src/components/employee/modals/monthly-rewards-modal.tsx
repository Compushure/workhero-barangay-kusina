'use client';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RewardCard } from '@/components/employee/mercado/reward-card';
import { Package, Sparkles, AlertCircle } from 'lucide-react';
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

export function MonthlyRewardsModal({
  open,
  onOpenChange,
  month,
  rewards,
  userPoints,
  pendingRewardIds,
}: MonthlyRewardsModalProps) {
  const monthName = month ? MONTH_NAMES[month - 1] : '';

  // Debug logging when modal opens
  useEffect(() => {
    if (open && month) {
      console.group(`🔴 MONTHLY STALL MODAL - ${monthName} (Month ${month})`);
      console.log('Rewards received:', rewards.length);
      if (rewards.length > 0) {
        console.table(rewards.map(r => ({
          Name: r.name,
          'Available Month': r.availableMonth,
          'Is Active': r.isActive,
          'Points Cost': r.pointsCost,
          'Stock': r.quantity ?? 'Unlimited'
        })));
      } else {
        console.warn('⚠️ No rewards found for this month!');
        console.log('This could mean:');
        console.log('1. No items assigned to month', month, 'in database');
        console.log('2. Items exist but is_active = false');
        console.log('3. Items exist but available_month is NULL or different number');
      }
      console.groupEnd();
    }
  }, [open, month, rewards, monthName]);

  if (!month) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] p-0 bg-[#fff8f5]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b-2 border-[#690003]/20 bg-linear-to-r from-[#fef5f1] to-[#fff8f5]">
          <DialogTitle className="text-2xl font-bold text-[#690003] flex items-center gap-3">
            <div className="relative">
              <Package className="h-7 w-7 text-[#690003]" />
              <Sparkles className="h-3 w-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="pixelated-text">{monthName} Market</span>
          </DialogTitle>
          <DialogDescription className="text-[#7a3d3d] font-medium">
            {rewards.length > 0 ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {rewards.length} special {rewards.length === 1 ? 'treasure' : 'treasures'} available
                this month!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full" />
                No items available for {monthName} yet
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-120px)]">
          {rewards.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-100 text-center px-6 py-8">
              {/* Empty State */}
              <div className="relative mb-6">
                <Package className="h-20 w-20 text-gray-300" />
                <span className="absolute -top-2 -right-2 text-4xl">🔒</span>
              </div>
              <h3 className="text-[#5a2a2a] text-xl font-bold mb-3">Empty Stall!</h3>
              <p className="text-[#7a3d3d] text-base mb-6 max-w-md">
                No rewards have been assigned to {monthName} yet. <br />
                Check other months or come back later! 🏪
              </p>

              {/* Debug Info */}
              <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg max-w-md">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-left text-sm">
                    <p className="font-semibold text-blue-900 mb-1">Debug Info (Check Console)</p>
                    <p className="text-blue-800 mb-2">
                      No items found with <code className="bg-blue-100 px-1 rounded">available_month = {month}</code>
                    </p>
                    <p className="text-xs text-blue-700">
                      ℹ️ Add items via <strong>HR Mercado</strong> → Select "{monthName}" from dropdown
                    </p>
                  </div>
                </div>
              </div>
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
