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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RewardCard } from '@/components/employee/mercado/reward-card';
import { Package, Sparkles, AlertCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { Reward } from '@/types';

interface MonthlyRewardsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: number | null;
  rewards: Reward[];
  isLoading?: boolean;
  userPoints: number;
  pendingRewardIds: Set<string>;
}

const ITEMS_PER_PAGE = 8;
const MODAL_CONTENT_CLASS =
  'bg-[#e8d9c0] border border-[#8a6844] w-[60vw] max-w-[60vw] sm:max-w-[60vw] md:max-w-[60vw] lg:max-w-[60vw] max-h-[86vh] rounded-2xl p-0 flex flex-col overflow-hidden shadow-xl';
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
  isLoading = false,
  userPoints,
  pendingRewardIds,
}: MonthlyRewardsModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Derived State
  const monthName = month ? MONTHS[month - 1] : '';

  const filteredAndSortedRewards = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = rewards.filter((reward) => {
      if (!normalizedSearch) return true;

      const nameMatches = reward.name.toLowerCase().includes(normalizedSearch);
      const categoryMatches = reward.category?.toLowerCase().includes(normalizedSearch) ?? false;

      return nameMatches || categoryMatches;
    });

    return [...filtered].sort((first, second) => {
      const firstTime = first.createdAt ? new Date(first.createdAt).getTime() : 0;
      const secondTime = second.createdAt ? new Date(second.createdAt).getTime() : 0;

      return sortOrder === 'newest' ? secondTime - firstTime : firstTime - secondTime;
    });
  }, [rewards, searchTerm, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedRewards.length / ITEMS_PER_PAGE));

  const paginatedRewards = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedRewards.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedRewards, currentPage]);

  // Sync page on month change
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm('');
    setSortOrder('newest');
  }, [month, open]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder]);

  if (!month) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={MODAL_CONTENT_CLASS}>
        {/* Header Section */}
        <DialogHeader className="p-6 pb-4 border-b border-[#8a6844]/30 bg-[#ded0b8] space-y-1 items-center text-center">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-[#3f2a1a] flex items-center justify-center gap-3">
            <div className="relative p-2 bg-[#8a6844]/10 rounded-lg">
              <Package className="h-6 w-6 text-[#6a4a2d]" />
              <Sparkles className="h-4 w-4 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="pixelated-text tracking-tight">{monthName} Market Stall</span>
          </DialogTitle>
          <DialogDescription className="text-[#6b5038] text-sm text-center">
            Welcome KusinHero! Here are the rewards available for{' '}
            <span className="font-bold">{monthName}</span>.
          </DialogDescription>
        </DialogHeader>

        {/* Controls */}
        {rewards.length > 0 && !isLoading && (
          <div className="px-6 pt-3 pb-2 bg-[#e3d4bb] border-b border-[#8a6844]/20 flex items-center justify-between gap-3">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search items..."
              className="h-8 w-44 sm:w-52 text-xs bg-[#f6eddd] border-[#9b7a56] text-[#4b3522] placeholder:text-[#8d7255]"
            />

            <Select
              value={sortOrder}
              onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}
            >
              <SelectTrigger className="h-8 w-28 text-xs bg-[#f6eddd] border-[#9b7a56] text-[#4b3522]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#f6eddd] border-[#9b7a56] text-[#4b3522]">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#e6d7bf]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="h-10 w-10 text-[#6a4a2d] animate-spin mx-auto mb-3" />
              <p className="text-[#4b3522] font-semibold">Loading rewards...</p>
              <p className="text-[#6b5038] text-sm mt-1">
                Fetching available items for {monthName}
              </p>
            </div>
          ) : filteredAndSortedRewards.length === 0 ? (
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <footer className="p-4 bg-[#ded0b8] border-t border-[#8a6844]/25 flex items-center justify-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="text-[#4b3522] hover:bg-[#8a6844]/10"
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous
            </Button>

            <span className="text-sm font-bold text-[#4b3522]">
              {currentPage} / {totalPages}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="text-[#4b3522] hover:bg-[#8a6844]/10"
            >
              Next <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </footer>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Monthly Stalls empty rewards state
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
