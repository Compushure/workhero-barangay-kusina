'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RewardCard } from '@/components/employee/mercado/reward-card';
import { useCancelMyRedemptionRequest } from '@/hooks/tanstack/mutations/redemptionMutations';
import { format } from 'date-fns';
import { Package, Sparkles, AlertCircle, Loader2, Coins, Clock, XCircle } from 'lucide-react';
import type { RedemptionRequest, Reward } from '@/types';

type RewardInterval = 'weekly' | 'monthly' | 'yearly';

interface MonthlyRewardsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interval: RewardInterval | null;
  onIntervalChange: (interval: RewardInterval) => void;
  rewards: Reward[];
  isLoading?: boolean;
  userPoints: number;
  pendingRewardIds: Set<string>;
  pendingRequests: RedemptionRequest[];
}

const MODAL_CONTENT_CLASS =
  'bg-[#e8d9c0] border border-[#8a6844] !w-[88vw] sm:!w-[82vw] lg:!w-[68vw] xl:!w-[60vw] !max-w-[88vw] sm:!max-w-[82vw] lg:!max-w-[68vw] xl:!max-w-[980px] h-[75vh] sm:h-[72vh] lg:h-[68vh] rounded-2xl p-0 flex flex-col overflow-hidden shadow-xl';
const MODAL_GRID_CLASS =
  'grid auto-rows-fr [grid-template-columns:repeat(auto-fit,minmax(260px,300px))] justify-center items-start gap-3 sm:gap-4';
const INTERVAL_LABELS: Record<RewardInterval, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

function compareRewardsForDisplay(
  first: Reward,
  second: Reward,
  userPoints: number,
  sortOrder: 'newest' | 'oldest'
): number {
  const firstOutOfStock = Boolean(first.isOutOfStock);
  const secondOutOfStock = Boolean(second.isOutOfStock);

  if (firstOutOfStock !== secondOutOfStock) {
    return firstOutOfStock ? 1 : -1;
  }

  const firstAffordable = userPoints >= first.pointsCost;
  const secondAffordable = userPoints >= second.pointsCost;

  if (firstAffordable !== secondAffordable) {
    return firstAffordable ? -1 : 1;
  }

  const firstTime = first.createdAt ? new Date(first.createdAt).getTime() : 0;
  const secondTime = second.createdAt ? new Date(second.createdAt).getTime() : 0;

  return sortOrder === 'newest' ? secondTime - firstTime : firstTime - secondTime;
}

export function MonthlyRewardsModal({
  open,
  onOpenChange,
  interval,
  onIntervalChange,
  rewards,
  isLoading = false,
  userPoints,
  pendingRewardIds,
  pendingRequests,
}: MonthlyRewardsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [activeView, setActiveView] = useState<'items' | 'pending'>('items');
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  const intervalName = interval ? INTERVAL_LABELS[interval] : '';

  const filteredAndSortedRewards = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = rewards.filter((reward) => {
      if (pendingRewardIds.has(reward.id)) return false;

      if (!normalizedSearch) return true;

      const nameMatches = reward.name.toLowerCase().includes(normalizedSearch);
      const categoryMatches = reward.category?.toLowerCase().includes(normalizedSearch) ?? false;

      return nameMatches || categoryMatches;
    });

    return [...filtered].sort((first, second) =>
      compareRewardsForDisplay(first, second, userPoints, sortOrder)
    );
  }, [rewards, pendingRewardIds, searchTerm, sortOrder, userPoints]);

  const pendingRequestsForInterval = useMemo(() => {
    const intervalRewardIds = new Set(rewards.map((reward) => reward.id));
    return pendingRequests.filter((request) => intervalRewardIds.has(request.rewardId));
  }, [pendingRequests, rewards]);

  const filteredPendingRequests = useMemo(() => {
    const normalizedSearch = pendingSearchTerm.trim().toLowerCase();
    if (!normalizedSearch) return pendingRequestsForInterval;

    return pendingRequestsForInterval.filter((request) => {
      const name = (request.requestedItem || request.rewardName || '').toLowerCase();
      return name.includes(normalizedSearch);
    });
  }, [pendingRequestsForInterval, pendingSearchTerm]);

  useEffect(() => {
    setSearchTerm('');
    setPendingSearchTerm('');
    setSortOrder('newest');
    setActiveView('items');
  }, [interval, open]);

  useEffect(() => {
    if (!open) return;
    scrollAreaRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [open, interval, activeView, searchTerm, pendingSearchTerm, sortOrder]);

  if (!interval) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={MODAL_CONTENT_CLASS}>
        <DialogHeader className="p-4 sm:p-6 pb-4 border-b border-[#8a6844]/30 bg-[#ded0b8] space-y-1 items-center text-center">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-[#3f2a1a] flex items-center justify-center gap-3">
            <div className="relative p-2 bg-[#8a6844]/10 rounded-lg">
              <Package className="h-6 w-6 text-[#6a4a2d]" />
              <Sparkles className="h-4 w-4 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="pixelated-text tracking-tight">{intervalName} Market Stall</span>
          </DialogTitle>
          <DialogDescription className="text-[#6b5038] text-sm text-center">
            Welcome KusinHero! Here are the rewards available for{' '}
            <span className="font-bold">{intervalName}</span>.
          </DialogDescription>
        </DialogHeader>

        {!isLoading && (
          <div className="px-4 sm:px-6 pt-3 pb-3 bg-[#e3d4bb] border-b border-[#8a6844]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            {activeView === 'items' && rewards.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-start">
                <Select
                  value={interval || 'weekly'}
                  onValueChange={(value: RewardInterval) => onIntervalChange(value)}
                >
                  <SelectTrigger className="h-8 w-[100px] sm:w-32 text-xs bg-[#f6eddd] border-[#9b7a56] text-[#4b3522]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f6eddd] border-[#9b7a56] text-[#4b3522]">
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search items..."
                  className="h-8 w-[140px] sm:w-52 text-xs bg-[#f6eddd] border-[#9b7a56] text-[#4b3522] placeholder:text-[#8d7255]"
                />

                <Select
                  value={sortOrder}
                  onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}
                >
                  <SelectTrigger className="h-8 w-[100px] sm:w-28 text-xs bg-[#f6eddd] border-[#9b7a56] text-[#4b3522]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f6eddd] border-[#9b7a56] text-[#4b3522]">
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-start">
                <Select
                  value={interval || 'weekly'}
                  onValueChange={(value: RewardInterval) => onIntervalChange(value)}
                >
                  <SelectTrigger className="h-8 w-[100px] sm:w-32 text-xs bg-[#f6eddd] border-[#9b7a56] text-[#4b3522]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#f6eddd] border-[#9b7a56] text-[#4b3522]">
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  value={pendingSearchTerm}
                  onChange={(event) => setPendingSearchTerm(event.target.value)}
                  placeholder="Search pending..."
                  className="h-8 w-[140px] sm:w-56 text-xs bg-[#f6eddd] border-[#9b7a56] text-[#4b3522] placeholder:text-[#8d7255]"
                />
                <p className="text-xs text-[#6b5038] font-medium w-full text-center sm:w-auto sm:text-left mt-1 sm:mt-0">
                  Pending requests for {intervalName}: {filteredPendingRequests.length}
                </p>
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setActiveView((current) => (current === 'items' ? 'pending' : 'items'))
              }
              className="h-8 w-full sm:w-auto border-[#9b7a56] bg-[#f6eddd] text-[#4b3522] hover:bg-[#ecdcbf]"
            >
              {activeView === 'items'
                ? `See My Pending Requests (${pendingRequestsForInterval.length})`
                : 'Back to Available Items'}
            </Button>
          </div>
        )}

        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#e6d7bf]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="h-10 w-10 text-[#6a4a2d] animate-spin mx-auto mb-3" />
              <p className="text-[#4b3522] font-semibold">Loading rewards...</p>
              <p className="text-[#6b5038] text-sm mt-1">
                Fetching available items for {intervalName}
              </p>
            </div>
          ) : activeView === 'pending' ? (
            <PendingRequestsView
              requests={filteredPendingRequests}
              intervalName={intervalName}
              rewards={rewards}
            />
          ) : filteredAndSortedRewards.length === 0 ? (
            <EmptyState intervalName={intervalName} />
          ) : (
            <div className={MODAL_GRID_CLASS}>
              {filteredAndSortedRewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  userPoints={userPoints}
                  hasPendingRequest={pendingRewardIds.has(reward.id)}
                  onRedeemSuccess={() => setActiveView('pending')}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PendingRequestsView({
  requests,
  intervalName,
  rewards,
}: {
  requests: RedemptionRequest[];
  intervalName: string;
  rewards: Reward[];
}) {
  const cancelMutation = useCancelMyRedemptionRequest();

  const rewardImageById = useMemo(() => {
    return new Map(rewards.map((reward) => [reward.id, reward.imageUrl]));
  }, [rewards]);

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-white/40 p-8 rounded-full mb-6">
          <AlertCircle className="h-14 w-14 text-gray-400/70" />
        </div>
        <h3 className="text-[#5a2a2a] text-2xl font-bold mb-2">No Pending Requests</h3>
        <p className="text-[#7a3d3d] max-w-sm">
          You have no pending reward requests for {intervalName}.
        </p>
      </div>
    );
  }

  return (
    <div className={MODAL_GRID_CLASS}>
      {requests.map((request) => (
        <Card
          key={request.id}
          className="group relative overflow-hidden bg-[#eadbc1] border border-[#8a6844] hover:border-[#6f4f31] transition-all duration-200 shadow-md h-full min-h-72 min-w-0 flex flex-col rounded-lg"
        >
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="relative h-24 w-full overflow-hidden bg-[#dfcfb3] border-b border-[#8a6844]/20">
              {rewardImageById.get(request.rewardId) ? (
                <Image
                  src={rewardImageById.get(request.rewardId)!}
                  alt={request.requestedItem || request.rewardName}
                  fill
                  unoptimized
                  className="object-contain p-2 pixelated"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="h-10 w-10 text-[#8a6844]/60" />
                </div>
              )}

              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <Badge className="bg-[#c68a2e] text-white hover:bg-[#c68a2e] text-[9px] px-1.5 py-0">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              </div>
            </div>

            <div className="px-3 py-2 flex-1 flex flex-col gap-1.5 min-w-0 text-[#4f3a26]">
              <h3 className="text-xl sm:text-2xl leading-none font-bold text-[#3b2615] line-clamp-1 pixelated-text min-w-0 text-center">
                {request.requestedItem || request.rewardName}
              </h3>

              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs sm:text-sm min-w-0 text-center place-items-center">
                <span className="text-[#6b4d2f] font-semibold truncate text-center">Price:</span>
                <span className="text-[#6b4d2f] font-semibold truncate text-center">
                  Requested:
                </span>

                <span className="text-[#a56d1f] font-semibold truncate text-center">
                  {request.pointsCost.toLocaleString()} {request.pointsCost === 1 ? 'pt' : 'pts'}
                </span>
                <span className="text-[#8f6435] font-semibold truncate text-center">
                  {format(new Date(request.requestedAt), 'MMM dd, yyyy')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs sm:text-sm min-w-0 text-center place-items-center">
                <span className="text-[#6b5a46] font-medium truncate text-center">Quantity:</span>
                <span className="text-[#6b5a46] font-medium truncate text-center">Total:</span>

                <span className="text-[#5d4a34] font-semibold truncate text-center">
                  {request.quantity}
                </span>
                <span className="text-[#6f4f31] font-semibold truncate text-center">
                  {request.pointsCost * request.quantity}
                </span>
              </div>

              <p className="text-[11px] text-[#6b5038] text-center">
                Requested at {format(new Date(request.requestedAt), 'h:mm a')}
              </p>
            </div>
          </CardContent>

          <CardFooter className="p-2.5 pt-0 min-w-0">
            <Button
              onClick={() => cancelMutation.mutate({ requestId: request.id })}
              disabled={cancelMutation.isPending || request.id.startsWith('optimistic-')}
              className="w-full h-11 text-sm font-bold transition-all duration-200 border-b-4 border-[#7f2e21] min-w-0 bg-[#b8473e] hover:bg-[#9f3a33] text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:border-b-0"
            >
              {cancelMutation.isPending ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                  Cancelling...
                </>
              ) : request.id.startsWith('optimistic-') ? (
                <span className="inline-flex items-center gap-1">
                  Syncing... <Clock className="h-3.5 w-3.5" />
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 min-w-0 truncate">
                  Cancel Request <XCircle className="h-3.5 w-3.5" />
                </span>
              )}
            </Button>
          </CardFooter>

          <div className="absolute bottom-3 left-3 text-[11px] text-[#6b5038] inline-flex items-center gap-1">
            <Coins className="h-3 w-3" />
            Refunded on cancel
          </div>

          <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-[#6f5338]/15 rounded-xl" />
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ intervalName }: { intervalName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-white/40 p-8 rounded-full mb-6">
        <Package className="h-16 w-16 text-gray-400/60" />
      </div>
      <h3 className="text-[#5a2a2a] text-2xl font-bold mb-2">No Stock Available</h3>
      <p className="text-[#7a3d3d] max-w-sm mb-8">
        We couldn't find any rewards specifically for {intervalName}. Check back soon or browse
        other intervals!
      </p>
    </div>
  );
}
