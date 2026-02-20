'use client';

import { useState, useMemo, memo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Coins, Package, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useRedeemReward } from '@/hooks/tanstack/mutations/redemptionMutations';
import { cn } from '@/lib/utils';
import type { Reward } from '@/types';

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  hasPendingRequest: boolean;
}

export const RewardCard = memo(function RewardCard({
  reward,
  userPoints,
  hasPendingRequest,
}: RewardCardProps) {
  const [imageError, setImageError] = useState(false);
  const redeemMutation = useRedeemReward();

  // Calculate if user can afford this reward
  const canAfford = useMemo(() => userPoints >= reward.pointsCost, [userPoints, reward.pointsCost]);

  // Check if item is out of stock
  const isOutOfStock = useMemo(() => {
    return reward.quantity !== undefined && reward.quantity !== null && reward.quantity <= 0;
  }, [reward.quantity]);

  // Determine if redeem button should be disabled
  const isDisabled = useMemo(() => {
    return !canAfford || isOutOfStock || hasPendingRequest || redeemMutation.isPending;
  }, [canAfford, isOutOfStock, hasPendingRequest, redeemMutation.isPending]);

  const handleRedeem = async () => {
    if (isDisabled) return;

    try {
      await redeemMutation.mutateAsync({
        rewardId: reward.id,
        quantity: 1,
        rewardName: reward.name,
      });
    } catch (error) {
      console.error('Failed to redeem reward:', error);
    }
  };

  return (
    <Card className="group relative overflow-hidden bg-white border-2 border-[#e0cfcf] hover:border-[#a83232] transition-all duration-300 hover:shadow-xl">
      <CardContent className="p-4">
        {/* Image Container */}
        <div className="relative aspect-square w-full mb-4 bg-linear-to-br from-[#fff8f5] to-[#fef5f1] rounded-xl overflow-hidden">
          {reward.imageUrl && !imageError ? (
            <Image
              src={reward.imageUrl}
              alt={reward.name}
              fill
              className="object-cover pixelated transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="h-16 w-16 text-[#a83232]/20" />
            </div>
          )}

          {/* Status Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            {hasPendingRequest && (
              <Badge className="bg-amber-500 text-white hover:bg-amber-500 shadow-lg">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            )}
            {isOutOfStock && (
              <Badge className="bg-red-600 text-white hover:bg-red-600 shadow-lg">
                <XCircle className="h-3 w-3 mr-1" />
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Quantity Badge */}
          {reward.quantity !== undefined && reward.quantity !== null && reward.quantity > 0 && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="bg-white/90 text-[#5a2a2a] shadow-md">
                <Package className="h-3 w-3 mr-1" />
                {reward.quantity} left
              </Badge>
            </div>
          )}
        </div>

        {/* Reward Name */}
        <h3 className="text-lg font-bold text-[#690003] mb-2 line-clamp-2 min-h-14 pixelated-text">
          {reward.name}
        </h3>

        {/* Points Cost */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-600" />
            <span className="text-xl font-bold text-[#a83232]">
              {reward.pointsCost.toLocaleString()}
            </span>
            <span className="text-sm text-[#7a3d3d]">pts</span>
          </div>

          {/* Affordability Indicator */}
          {canAfford ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>

        {/* Redemption Limit */}
        {reward.redeemingLimit && (
          <p className="text-xs text-[#7a3d3d] mb-2">Limit: {reward.redeemingLimit} per month</p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleRedeem}
          disabled={isDisabled}
          className={cn(
            'w-full font-bold transition-all duration-300',
            canAfford && !isOutOfStock && !hasPendingRequest
              ? 'bg-[#a83232] hover:bg-[#8b0000] text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          )}
        >
          {redeemMutation.isPending ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Redeeming...
            </>
          ) : hasPendingRequest ? (
            'Already Requested'
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : !canAfford ? (
            `Need ${(reward.pointsCost - userPoints).toLocaleString()} more pts`
          ) : (
            <>
              <Package className="h-4 w-4 mr-2" />
              Redeem Now
            </>
          )}
        </Button>
      </CardFooter>

      {/* Shimmer Effect on Hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
    </Card>
  );
});
