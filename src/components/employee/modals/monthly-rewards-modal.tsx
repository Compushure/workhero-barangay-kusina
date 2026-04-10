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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RewardCard } from '@/components/employee/mercado/reward-card';
import { useCancelMyRedemptionRequest } from '@/hooks/tanstack/mutations/redemptionMutations';
import { format } from 'date-fns';
import {
  Package,
  Sparkles,
  AlertCircle,
  Loader2,
  Coins,
  Clock,
  XCircle,
  Search,
  ArrowUpDown,
} from 'lucide-react';
import type { RedemptionRequest, Reward } from '@/types';

type RewardInterval = 'weekly' | 'monthly' | 'yearly';

interface MonthlyRewardsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interval: RewardInterval | null;
  rewards: Reward[];
  isLoading?: boolean;
  userPoints: number;
  pendingRewardIds: Set<string>;
  pendingRequests: RedemptionRequest[];
}

const MODAL_CONTENT_CLASS =
  'bg-[#e8d9c0] border border-[#8a6844] !w-[90vw] sm:!w-[85vw] md:!w-[75vw] lg:!w-[70vw] xl:!w-[65vw] !max-w-[90vw] sm:!max-w-[85vw] md:!max-w-[75vw] lg:!max-w-[950px] h-[min(90dvh,56rem)] max-h-[90dvh] rounded-lg sm:rounded-xl md:rounded-2xl p-0 flex min-h-0 flex-col overflow-hidden shadow-2xl';
const MODAL_GRID_CLASS =
  'grid [grid-template-columns:repeat(3,1fr)] mobile:[grid-template-columns:repeat(3,1fr)] sm:[grid-template-columns:repeat(3,1fr)] md:[grid-template-columns:repeat(3,1fr)] lg:[grid-template-columns:repeat(3,1fr)] xl:[grid-template-columns:repeat(3,1fr)] justify-center items-start gap-3 sm:gap-4 md:gap-5 auto-rows-max';
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
  const [postRedeemLoading, setPostRedeemLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  const intervalName = interval ? INTERVAL_LABELS[interval] : '';

  const switchViewWithLoading = (nextView: 'items' | 'pending') => {
    if (nextView === activeView) return;

    setPostRedeemLoading(true);
    setActiveView(nextView);
  };

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
    setPostRedeemLoading(false);
  }, [interval, open]);

  useEffect(() => {
    if (!postRedeemLoading) return;

    // Keep a short transition loader after redeem so stock state changes don't flash.
    const timeout = setTimeout(() => {
      setPostRedeemLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [postRedeemLoading]);

  useEffect(() => {
    if (!open) return;
    scrollAreaRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [open, interval, activeView, searchTerm, pendingSearchTerm, sortOrder]);

  if (!interval) return null;

  const shouldShowLoading = isLoading || postRedeemLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={MODAL_CONTENT_CLASS}>
        <DialogHeader className="px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 pb-0 sm:pb-0 md:pb-0 space-y-1 sm:space-y-1.5 items-center text-center">
          <DialogTitle className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[#3f2a1a] flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 flex-wrap">
            <div className="relative p-0.5 sm:p-1 md:p-1.5 bg-[#8a6844]/10 rounded">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#6a4a2d]" />
              <Sparkles className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 text-amber-500 absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>
            <span className="pixelated-text tracking-tight leading-none">
              {intervalName} Market Stall
            </span>
          </DialogTitle>
          <DialogDescription className="text-[#6b5038] text-xs sm:text-sm md:text-base text-center leading-tight px-2">
            Welcome KusinHero! Here are the rewards available for{' '}
            <span className="font-bold">{intervalName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="px-2 sm:px-4 md:px-6 lg:px-8 pt-0 sm:pt-0 md:pt-0 pb-2 sm:pb-2.5 md:pb- bg-[#e3d4bb] border-b border-[#8a6844]/20 flex flex-col w-full">
          <div className="flex w-full min-w-0 flex-col items-stretch lg:flex-row lg:items-center lg:justify-between">
            {activeView === 'items' && rewards.length > 0 ? (
              <>
                <div className="min-w-0 flex-1 lg:max-w-md">
                  <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d7255]" />
                    <Input
                      value={searchTerm}
                      onChange={(event) => {
                        const value = event.target.value;
                        setSearchTerm(value.trim());
                      }}
                      placeholder="Search items..."
                      className="h-8 sm:h-9 md:h-10 pl-9 text-xs sm:text-sm bg-[#f6eddd] border-[#9b7a56] text-[#4b3522] placeholder:text-[#8d7255]"
                    />
                  </div>
                </div>

                <div className="flex min-w-0 flex-wrap gap-2 sm:gap-3 lg:flex-nowrap lg:shrink-0">
                  <Select
                    value={sortOrder || 'newest'}
                    onValueChange={(value) => {
                      if (value === 'newest' || value === 'oldest') {
                        setSortOrder(value);
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 sm:h-9 md:h-10 w-full text-xs sm:text-sm bg-[#f6eddd] border-[#9b7a56] text-[#4b3522] hover:bg-[#8a6844] hover:text-white hover:border-[#6a4a2d] lg:w-32">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#f6eddd] border-[#9b7a56] text-[#4b3522]">
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                    </SelectContent>
                  </Select>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm border-[#9b7a56] bg-[#f6eddd] text-[#4b3522] hover:bg-[#8a6844] hover:text-white hover:border-[#6a4a2d] justify-between px-2 lg:w-auto"
                      >
                        <span className="truncate">
                          Pending ({pendingRequestsForInterval.length})
                        </span>
                        <ArrowUpDown size={14} className="ml-1.5 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel className="text-xs font-semibold text-[#4b3522]">
                        View
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => switchViewWithLoading('items')}
                        className={
                          (activeView as 'items' | 'pending') === 'items' ? 'bg-[#8a6844]/15' : ''
                        }
                      >
                        Available Items
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => switchViewWithLoading('pending')}
                        className={
                          (activeView as 'items' | 'pending') === 'pending' ? 'bg-[#8a6844]/15' : ''
                        }
                      >
                        My Pending Requests
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <>
                <div className="min-w-0 flex-1 lg:max-w-md">
                  <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d7255]" />
                    <Input
                      value={pendingSearchTerm}
                      onChange={(event) => {
                        const value = event.target.value;
                        setPendingSearchTerm(value.trim());
                      }}
                      placeholder="Search pending..."
                      className="h-8 sm:h-9 md:h-10 pl-9 text-xs sm:text-sm bg-[#f6eddd] border-[#9b7a56] text-[#4b3522] placeholder:text-[#8d7255]"
                    />
                  </div>
                </div>

                <div className="flex min-w-0 flex-wrap gap-2 sm:gap-3 lg:flex-nowrap lg:shrink-0 items-center">
                  <p className="text-xs sm:text-sm text-[#6b5038] font-medium whitespace-nowrap">
                    Showing: {filteredPendingRequests.length || 0}
                  </p>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm border-[#9b7a56] bg-[#f6eddd] text-[#4b3522] hover:bg-[#ecdcbf] justify-between px-2 lg:w-auto"
                      >
                        <span className="truncate">View Items</span>
                        <ArrowUpDown size={14} className="ml-1.5 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel className="text-xs font-semibold text-[#4b3522]">
                        View
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => switchViewWithLoading('items')}
                        className={
                          (activeView as 'items' | 'pending') === 'items' ? 'bg-[#8a6844]/15' : ''
                        }
                      >
                        Available Items
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => switchViewWithLoading('pending')}
                        className={
                          (activeView as 'items' | 'pending') === 'pending' ? 'bg-[#8a6844]/15' : ''
                        }
                      >
                        My Pending Requests
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>
        </div>

        <div
          ref={scrollAreaRef}
          className="min-h-0 flex-1 overflow-y-auto p-0 sm:p-0 md:p-2 lg:p-2 bg-[#e6d7bf]"
        >
          {shouldShowLoading ? (
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
                  onRedeemSuccess={() => {
                    switchViewWithLoading('pending');
                  }}
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
      <div className="flex flex-col items-center justify-center py-10 sm:py-14 md:py-20 text-center">
        <div className="bg-white/40 p-4 sm:p-6 rounded-full mb-3 sm:mb-5">
          <AlertCircle className="h-9 w-9 sm:h-12 sm:w-12 md:h-14 md:w-14 text-gray-400/70" />
        </div>
        <h3 className="text-[#5a2a2a] text-sm sm:text-lg md:text-2xl font-bold mb-1 sm:mb-2">
          No Pending Requests
        </h3>
        <p className="text-[#7a3d3d] text-[10px] sm:text-sm max-w-sm px-2">
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
          className="group relative overflow-hidden bg-[#eadbc1] border border-[#8a6844] hover:border-[#6f4f31] transition-all duration-200 shadow-md min-h-auto min-w-0 flex flex-col rounded-lg"
        >
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="relative h-20 sm:h-24 md:h-28 lg:h-32 w-full overflow-hidden bg-[#dfcfb3] border-b border-[#8a6844]/20">
              {rewardImageById.get(request.rewardId) ? (
                <Image
                  src={rewardImageById.get(request.rewardId)!}
                  alt={request.requestedItem || request.rewardName}
                  fill
                  unoptimized
                  className="object-contain p-0.5 sm:p-1 md:p-2 pixelated"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-[#8a6844]/60" />
                </div>
              )}

              <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 flex flex-col gap-0.5 sm:gap-1">
                <Badge className="bg-[#c68a2e] text-white hover:bg-[#c68a2e] text-xs sm:text-sm md:text-base px-1.5 sm:px-2 md:px-2.5 py-1">
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 mr-0.5 sm:mr-1" />
                  Pending
                </Badge>
              </div>
            </div>

            <div className="px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 flex-1 flex flex-col gap-0.75 sm:gap-1 min-w-0 text-[#4f3a26]">
              <h3 className="text-sm sm:text-base md:text-lg leading-tight font-bold text-[#3b2615] line-clamp-2 pixelated-text min-w-0 text-center">
                {request.requestedItem || request.rewardName}
              </h3>

              <div className="grid grid-cols-2 gap-x-1 sm:gap-x-1.5 gap-y-1 sm:gap-y-1.5 text-sm sm:text-base md:text-base min-w-0 text-center place-items-center">
                <span className="text-[#6b4d2f] font-semibold text-center text-xs sm:text-sm md:text-base">
                  Price:
                </span>
                <span className="text-[#6b4d2f] font-semibold text-center text-xs sm:text-sm md:text-base">
                  Requested:
                </span>

                <span className="text-[#a56d1f] font-bold truncate text-center text-sm sm:text-base md:text-lg">
                  {request.pointsCost.toLocaleString()}
                </span>
                <span className="text-[#8f6435] font-bold truncate text-center text-sm sm:text-base md:text-lg">
                  {format(new Date(request.requestedAt), 'M/d')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-1 sm:gap-x-1.5 gap-y-1 sm:gap-y-1.5 text-sm sm:text-base md:text-base min-w-0 text-center place-items-center">
                <span className="text-[#6b5a46] font-semibold text-center text-xs sm:text-sm md:text-base">
                  Qty:
                </span>
                <span className="text-[#6b5a46] font-semibold text-center text-xs sm:text-sm md:text-base">
                  Total:
                </span>

                <span className="text-[#5d4a34] font-bold truncate text-center text-sm sm:text-base md:text-lg">
                  ×{request.quantity}
                </span>
                <span className="text-[#6f4f31] font-bold truncate text-center text-sm sm:text-base md:text-lg">
                  {request.pointsCost * request.quantity}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#6b5038] text-center font-medium">
                {format(new Date(request.requestedAt), 'h:mm a')}
              </p>
            </div>
          </CardContent>

          <CardFooter className="px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 pt-0.5 min-w-0">
            <Button
              onClick={() => cancelMutation.mutate({ requestId: request.id })}
              disabled={cancelMutation.isPending || request.id.startsWith('optimistic-')}
              className="w-full h-7 sm:h-8 md:h-9 lg:h-10 text-xs sm:text-sm md:text-base font-bold transition-all duration-200 border-b-2 sm:border-b-3 md:border-b-3 border-[#7f2e21] min-w-0 bg-[#b8473e] hover:bg-[#9f3a33] text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:border-b-2 sm:disabled:border-b-3"
            >
              {cancelMutation.isPending ? (
                <>
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  Cancel...
                </>
              ) : request.id.startsWith('optimistic-') ? (
                <span className="inline-flex items-center gap-1 text-xs sm:text-sm">
                  Sync <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 min-w-0 truncate">
                  Cancel <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
                </span>
              )}
            </Button>
          </CardFooter>

          <div className="absolute bottom-1 left-1 text-xs sm:text-sm text-[#6b5038] inline-flex items-center gap-1 font-medium">
            <Coins className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            Refund
          </div>

          <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-[#6f5338]/15 rounded-lg" />
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ intervalName }: { intervalName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 lg:py-20 text-center px-2">
      <div className="bg-white/40 p-4 sm:p-6 md:p-8 rounded-full mb-3 sm:mb-4 md:mb-6">
        <Package className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-gray-400/60" />
      </div>
      <h3 className="text-[#5a2a2a] text-sm sm:text-lg md:text-2xl font-bold mb-1 sm:mb-2">
        No Stock Available
      </h3>
      <p className="text-[#7a3d3d] max-w-sm text-[10px] sm:text-xs md:text-sm mb-4 sm:mb-6 md:mb-8">
        We couldn't find any rewards specifically for {intervalName}. Check back soon or browse
        other intervals!
      </p>
    </div>
  );
}
