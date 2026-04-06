'use client';

import { useState, useMemo, useEffect, memo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Coins, Package, CheckCircle2, Clock, XCircle, Minus, Plus } from 'lucide-react';
import { useRedeemReward } from '@/hooks/tanstack/mutations/redemptionMutations';
import { cn } from '@/lib/utils';
import type { Reward } from '@/types';

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  hasPendingRequest: boolean;
  onRedeemSuccess?: (payload: {
    rewardId: string;
    rewardName: string;
    quantity: number;
    pointsCost: number;
  }) => void;
}

export const RewardCard = memo(function RewardCard({
  reward,
  userPoints,
  hasPendingRequest,
  onRedeemSuccess,
}: RewardCardProps) {
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const redeemMutation = useRedeemReward();

  const isOutOfStock = useMemo(() => {
    return reward.quantity !== undefined && reward.quantity !== null && reward.quantity <= 0;
  }, [reward.quantity]);

  const maxByLimit =
    reward.redeemingLimit && reward.redeemingLimit > 0 ? reward.redeemingLimit : Infinity;
  const maxByStock = reward.quantity && reward.quantity > 0 ? reward.quantity : Infinity;
  const maxByPoints = reward.pointsCost > 0 ? Math.floor(userPoints / reward.pointsCost) : 0;

  const maxSelectable = useMemo(() => {
    if (isOutOfStock) return 0;

    const boundedByPoints = maxByPoints === 0 ? Infinity : maxByPoints;
    const value = Math.min(maxByLimit, maxByStock, boundedByPoints);

    if (!Number.isFinite(value)) return 99;
    return Math.max(0, value);
  }, [isOutOfStock, maxByLimit, maxByStock, maxByPoints]);

  useEffect(() => {
    if (maxSelectable <= 0) {
      setQuantity(1);
      return;
    }

    setQuantity((previous) => Math.min(Math.max(1, previous), maxSelectable));
  }, [maxSelectable]);

  const totalPoints = quantity * reward.pointsCost;
  const canAfford = useMemo(() => userPoints >= totalPoints, [userPoints, totalPoints]);
  const pointLabel = (value: number) => (value === 1 ? 'pt' : 'pts');

  const isDisabled = useMemo(() => {
    return (
      !canAfford ||
      isOutOfStock ||
      hasPendingRequest ||
      redeemMutation.isPending ||
      maxSelectable <= 0
    );
  }, [canAfford, isOutOfStock, hasPendingRequest, redeemMutation.isPending, maxSelectable]);

  const handleRedeem = async () => {
    if (isDisabled) return;

    try {
      const result = await redeemMutation.mutateAsync({
        rewardId: reward.id,
        quantity,
        rewardName: reward.name,
        pointsCost: reward.pointsCost,
      });

      onRedeemSuccess?.(result);
    } catch (error) {
      console.error('Failed to redeem reward:', error);
    }
  };

  return (
    <Card className="p-1.5 sm:p-2 md:p-2.5 lg:p-3 group relative overflow-hidden bg-parchment border border-[#8a6844] hover:border-[#6f4f31] transition-all duration-200 shadow-md h-full hover:shadow-xl min-h-auto min-w-0 flex flex-col rounded-lg hover:scale-105">
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="relative h-24 sm:h-28 md:h-32 lg:h-36 w-full overflow-hidden bg-[#f0e6d2]">
          {reward.imageUrl && !imageError ? (
            <Image
              src={reward.imageUrl}
              alt={reward.name}
              fill
              unoptimized
              className="object-contain p-1"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="h-6 w-6 sm:h-7 sm:w-7 md:h-9 md:w-9 text-[#8a6844]/60" />
            </div>
          )}

          <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 md:top-1.5 md:right-1.5 flex flex-col gap-0.5 sm:gap-1">
            {hasPendingRequest && (
              <Badge className="bg-[#c68a2e] text-white hover:bg-[#c68a2e] text-[7px] sm:text-[8px] md:text-xs px-1 sm:px-1.5 md:px-2 py-0.5">
                <Clock className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 mr-0.5 sm:mr-1" />
                Pending
              </Badge>
            )}
            {isOutOfStock && (
              <Badge className="bg-[#a84b3e] text-white hover:bg-[#a84b3e] text-[7px] sm:text-[8px] md:text-xs px-1 sm:px-1.5 md:px-2 py-0.5">
                <XCircle className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 mr-0.5 sm:mr-1" />
                Stock
              </Badge>
            )}
          </div>
        </div>

        <div className="px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 md:py-2.5 flex-1 flex flex-col gap-0.75 sm:gap-1 md:gap-1.5 min-w-0 text-[#4f3a26]">
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl leading-snug font-bold text-[#3b2615] whitespace-normal wrap-break-word pixelated-text min-w-0 text-center line-clamp-2">
              {reward.name}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-x-2 sm:gap-x-2.5 gap-y-1.5 sm:gap-y-2 min-w-0 text-center place-items-center">
            <span className="text-[#6b4d2f] font-semibold truncate text-center text-sm sm:text-base md:text-base">
              Price:
            </span>
            <span className="text-[#6b4d2f] font-semibold truncate text-center text-sm sm:text-base md:text-base">
              Stock:
            </span>

            <span className="text-[#a56d1f] font-bold truncate text-center text-base sm:text-lg md:text-xl">
              {reward.pointsCost.toLocaleString()}
            </span>
            <span className="text-[#8f6435] font-bold truncate text-center text-base sm:text-lg md:text-xl">
              {reward.quantity ?? '∞'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-2 sm:gap-x-2.5 gap-y-1.5 sm:gap-y-2 min-w-0 text-center place-items-center">
            <span className="text-[#6b5a46] font-semibold truncate text-center text-sm sm:text-base md:text-base">
              Limit:
            </span>
            <span className="text-[#6b5a46] font-semibold truncate text-center text-sm sm:text-base md:text-base">
              Total:
            </span>

            <span className="text-[#5d4a34] font-bold truncate text-center text-base sm:text-lg md:text-xl">
              {reward.redeemingLimit ?? 1}
            </span>
            <span className="text-[#6f4f31] font-bold truncate text-center text-base sm:text-lg md:text-xl">
              {totalPoints.toLocaleString()}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-center gap-1.5 pt-0.5 pb-0">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setQuantity((previous) => Math.max(1, previous - 1))}
              disabled={quantity <= 1 || isDisabled}
              className="h-6 sm:h-7 md:h-8 w-6 sm:w-7 md:w-8 rounded bg-[#6d472a] text-white hover:bg-[#5a3a22] disabled:opacity-40 transition-colors"
            >
              <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
            </Button>
            <span className="min-w-5 text-center text-sm sm:text-base md:text-lg font-bold text-[#3f2614]">
              {quantity}
            </span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setQuantity((previous) => Math.min(maxSelectable, previous + 1))}
              disabled={quantity >= maxSelectable || isDisabled}
              className="h-6 sm:h-7 md:h-8 w-6 sm:w-7 md:w-8 rounded bg-[#6d472a] text-white hover:bg-[#5a3a22] disabled:opacity-40 transition-colors"
            >
              <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-2 sm:px-2.5 md:px-3 pb-1.5 sm:pb-2 md:pb-2.5 pt-0.5 min-w-0">
        <Button
          onClick={handleRedeem}
          disabled={isDisabled}
          className={cn(
            'w-full h-7 sm:h-8 md:h-9 lg:h-10 text-sm sm:text-base md:text-lg font-bold transition-all duration-200 border-b-2 sm:border-b-3 md:border-b-3 border-[#6d472a] min-w-0 px-2 ',
            canAfford && !isOutOfStock && !hasPendingRequest
              ? 'bg-[#d6962f] hover:bg-[#c18425] text-primary'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed border-b-2 sm:border-b-2 md:border-b-3'
          )}
        >
          {redeemMutation.isPending ? (
            <>
              <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
              Ordering...
            </>
          ) : hasPendingRequest ? (
            'Requested'
          ) : isOutOfStock ? (
            'Out Stock'
          ) : !canAfford ? (
            <span className="inline-flex items-center gap-1 min-w-0 truncate">
              Need {(totalPoints - userPoints).toLocaleString()}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 min-w-0 truncate">
              <Package className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3" />
              Order ({totalPoints.toLocaleString()})
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
});
