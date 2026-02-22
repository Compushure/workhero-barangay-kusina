'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RewardCard } from '@/components/employee/mercado/reward-card';
import { Package, Sparkles, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Reward } from '@/types';

interface MonthlyRewardsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: number | null;
  rewards: Reward[];
  userPoints: number;
  pendingRewardIds: Set<string>;
}

const ITEMS_PER_PAGE = 8;
const MODAL_CONTENT_CLASS =
  'bg-[#f5e5dc] border-none w-screen max-w-screen max-h-[86vh] rounded-2xl p-0 flex flex-col overflow-hidden';
const MODAL_GRID_CLASS = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
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
];

export function MonthlyRewardsModal({
  open,
  onOpenChange,
  month,
  rewards,
  userPoints,
  pendingRewardIds,
}: MonthlyRewardsModalProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Derived State
  const monthName = month ? MONTHS[month - 1] : '';
  const totalPages = Math.max(1, Math.ceil(rewards.length / ITEMS_PER_PAGE));

  const paginatedRewards = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return rewards.slice(start, start + ITEMS_PER_PAGE);
  }, [rewards, currentPage]);

  // Sync page on month change
  useEffect(() => {
    setCurrentPage(1);
  }, [month, open]);

  if (!month) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={MODAL_CONTENT_CLASS}>
        {/* Header Section */}
        <DialogHeader className="p-6 pb-4 border-b border-[#730202]/10 space-y-1">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-[#5a2a2a] flex items-center gap-3">
            <div className="relative p-2 bg-[#730202]/5 rounded-lg">
              <Package className="h-6 w-6 text-[#730202]" />
              <Sparkles className="h-4 w-4 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="pixelated-text tracking-tight">{monthName} Market Stall</span>
          </DialogTitle>
          <DialogDescription className="text-[#7a3d3d] flex items-center gap-2">
            {rewards.length > 0 ? (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Found {rewards.length} exclusive {rewards.length === 1 ? 'item' : 'items'}
              </>
            ) : (
              'This stall is currently being restocked...'
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#730202]/5">
          {rewards.length === 0 ? (
            <EmptyState monthName={monthName} monthId={month} />
          ) : (
            <div className={MODAL_GRID_CLASS}>
              {paginatedRewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  userPoints={userPoints}
                  hasPendingRequest={pendingRewardIds.has(reward.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer / Pagination */}
        {totalPages > 1 && (
          <footer className="p-4 bg-white/50 border-t border-[#730202]/10 flex items-center justify-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="text-[#5a2a2a] hover:bg-[#730202]/10"
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous
            </Button>

            <span className="text-sm font-bold text-[#5a2a2a]">
              {currentPage} / {totalPages}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="text-[#5a2a2a] hover:bg-[#730202]/10"
            >
              Next <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </footer>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Sub-component for Empty State to keep the main modal clean
 */
function EmptyState({ monthName, monthId }: { monthName: string; monthId: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-white/40 p-8 rounded-full mb-6">
        <Package className="h-16 w-16 text-gray-400/60" />
      </div>
      <h3 className="text-[#5a2a2a] text-2xl font-bold mb-2">No Stock Available</h3>
      <p className="text-[#7a3d3d] max-w-sm mb-8">
        We couldn't find any rewards specifically for {monthName}. Check back soon or browse other
        months!
      </p>
    </div>
  );
}
