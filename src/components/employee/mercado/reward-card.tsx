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
    <Card className=" p-1 group relative overflow-hidden bg-[#eadbc1] border border-t-0 border-[#8a6844] hover:border-[#6f4f31] transition-all duration-200 shadow-md h-full min-h-72 min-w-0 flex flex-col rounded-lg">
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="relative h-28 w-full overflow-hidden ">
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
              <Package className="h-10 w-10 text-[#8a6844]/60" />
            </div>
          )}

          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {hasPendingRequest && (
              <Badge className="bg-[#c68a2e] text-white hover:bg-[#c68a2e] text-[9px] px-1.5 py-0">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            )}
            {isOutOfStock && (
              <Badge className="bg-[#a84b3e] text-white hover:bg-[#a84b3e] text-[9px] px-1.5 py-0">
                <XCircle className="h-3 w-3 mr-1" />
                Out of Stock
              </Badge>
            )}
          </div>
        </div>

        <div className="px-3 py-1 flex-1 flex flex-col gap-2 min-w-0 text-[#4f3a26]">
          <div className="min-h-20 flex items-center justify-center">
            <h3 className="text-xl sm:text-xl leading-tight font-bold text-[#3b2615] whitespace-normal wrap-break-word pixelated-text min-w-0 text-center">
              {reward.name}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs sm:text-sm min-w-0 text-center place-items-center">
            <span className="text-[#6b4d2f] font-semibold truncate text-center">Price:</span>
            <span className="text-[#6b4d2f] font-semibold truncate text-center">Stock:</span>

            <span className="text-[#a56d1f] font-semibold truncate text-center">
              {reward.pointsCost.toLocaleString()} {pointLabel(reward.pointsCost)}
            </span>
            <span className="text-[#8f6435] font-semibold truncate text-center">
              {reward.quantity ?? 'Unlimited'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs sm:text-sm min-w-0 text-center place-items-center">
            <span className="text-[#6b5a46] font-medium truncate text-center">Limit:</span>
            <span className="text-[#6b5a46] font-medium truncate text-center">Total:</span>

            <span className="text-[#5d4a34] font-semibold truncate text-center">
              {reward.redeemingLimit ?? 1}
            </span>
            <span className="text-[#6f4f31] font-semibold truncate text-center">
              {totalPoints.toLocaleString()}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-center gap-2.5 pt-4 pb-0">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setQuantity((previous) => Math.max(1, previous - 1))}
              disabled={quantity <= 1 || isDisabled}
              className="h-8 w-8 rounded-md bg-[#6d472a] text-white hover:bg-[#5a3a22] disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="min-w-5 text-center text-sm font-bold text-[#3f2614]">{quantity}</span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setQuantity((previous) => Math.min(maxSelectable, previous + 1))}
              disabled={quantity >= maxSelectable || isDisabled}
              className="h-8 w-8 rounded-md bg-[#6d472a] text-white hover:bg-[#5a3a22] disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-3 pb-4 pt-0 min-w-0">
        <Button
          onClick={handleRedeem}
          disabled={isDisabled}
          className={cn(
            'w-full h-11 text-sm font-bold transition-all duration-200 border-b-2 border-[#6d472a] min-w-0 ',
            canAfford && !isOutOfStock && !hasPendingRequest
              ? 'bg-[#d6962f] hover:bg-[#c18425] text-[#22160d]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed border-b-2'
          )}
        >
          {redeemMutation.isPending ? (
            <>
              <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
              Ordering...
            </>
          ) : hasPendingRequest ? (
            'Already Requested'
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : !canAfford ? (
            <span className="inline-flex items-center gap-1 min-w-0 truncate">
              Need {(totalPoints - userPoints).toLocaleString()} more <Coins className="h-3 w-3" />
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 min-w-0 truncate">
              <Package className="h-3.5 w-3.5 mr-1" />
              Order ({totalPoints.toLocaleString()} <Coins className="h-3 w-3" />)
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
});
