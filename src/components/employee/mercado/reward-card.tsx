'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ImageIcon, Loader2 } from 'lucide-react';
import { useRedeemReward } from '@/hooks/tanstack/mutations/redemptionMutations';
import { formatNumber } from '@/lib/format';
import type { Reward } from '@/types';

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  hasPendingRequest: boolean;
}

export function RewardCard({ reward, userPoints, hasPendingRequest }: RewardCardProps) {
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const redeemMutation = useRedeemReward();

  const maxQuantity = reward.redeemingLimit || 99;
  const totalCost = reward.pointsCost * quantity;
  const canAfford = userPoints >= totalCost;
  const isOutOfStock = reward.quantity !== undefined && reward.quantity === 0;
  const canRedeem = canAfford && !hasPendingRequest && !isOutOfStock;
  const isRedeeming = redeemMutation.isPending;

  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= maxQuantity) {
      setQuantity(numValue);
    }
  };

  const handleRedeem = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (canRedeem && !isRedeeming) {
      redeemMutation.mutate(
        { rewardId: reward.id, quantity, rewardName: reward.name },
        {
          onSuccess: () => {
            // Reset quantity to 1 after successful redemption
            setQuantity(1);
          },
        }
      );
    }
  };

  return (
    <Card className="overflow-hidden border-[#690003]/20 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
              {reward.imageUrl && !imageError ? (
                <img
                  src={reward.imageUrl}
                  alt={reward.name}
                  className="h-full w-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <ImageIcon className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <CardTitle className="text-xl text-gray-900">{reward.name}</CardTitle>
          </div>
          <div className="flex flex-col items-end gap-1">
            {isOutOfStock && (
              <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                Out of Stock
              </Badge>
            )}
            {hasPendingRequest && !isOutOfStock && (
              <Badge className="bg-yellow-500 text-white text-xs">
                Pending Approval
              </Badge>
            )}
          </div>
        </div>
        {reward.category && (
          <CardDescription className="text-gray-600">{reward.category}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#7a3d3d]">Cost per item</span>
            <span className="text-lg font-bold text-[#690003]">
              {formatNumber(reward.pointsCost)} <span className="text-sm font-normal">pts</span>
            </span>
          </div>

          {reward.redeemingLimit && reward.redeemingLimit > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#7a3d3d]">Limit per request</span>
              <span className="text-sm font-medium text-[#5a2a2a]">{reward.redeemingLimit}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#5a2a2a]">Quantity</label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleDecrement}
                disabled={quantity <= 1 || isOutOfStock || isRedeeming}
                className="h-9 w-9 border-[#690003] text-[#690003] hover:bg-[#fbeaea]"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="1"
                max={maxQuantity}
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                disabled={isOutOfStock || isRedeeming}
                className="h-9 w-16 text-center border-[#690003] focus-visible:ring-[#690003]"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleIncrement}
                disabled={quantity >= maxQuantity || isOutOfStock || isRedeeming}
                className="h-9 w-9 border-[#690003] text-[#690003] hover:bg-[#fbeaea]"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#690003]/10">
            <span className="text-sm font-medium text-[#7a3d3d]">Total Cost</span>
            <span className="text-2xl font-bold text-[#690003]">
              {formatNumber(totalCost)} <span className="text-sm font-normal">pts</span>
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          onClick={handleRedeem}
          disabled={!canRedeem || isRedeeming}
          className={`w-full ${
            canRedeem && !isRedeeming
              ? 'bg-[#690003] hover:bg-[#8b0000] text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isRedeeming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redeeming...
            </>
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : hasPendingRequest ? (
            'Pending Approval'
          ) : !canAfford ? (
            'Insufficient Points'
          ) : (
            `Redeem (${formatNumber(totalCost)} pts)`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
