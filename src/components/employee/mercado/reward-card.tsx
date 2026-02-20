'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
    <div className="bg-[#3d2817] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow border-2 border-[#2a1a10]">
      {/* Image Section - Centered */}
      <div className="bg-[#2a1a10] rounded-lg p-8 mb-4 flex items-center justify-center min-h-45">
        {reward.imageUrl && !imageError ? (
          <img
            src={reward.imageUrl}
            alt={reward.name}
            className="max-h-37.5 max-w-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="text-6xl"></div>
        )}
      </div>

      {/* Item Name */}
      <h3 className="text-white font-bold text-lg mb-2 text-center pixelated-text">
        {reward.name}
      </h3>

      {/* Description/Category */}
      {reward.category && (
        <p className="text-[#c9a882] text-sm mb-4 text-center">{reward.category}</p>
      )}

      {/* Points and Stock Info */}
      <div className="flex items-center justify-between mb-2 text-sm">
        <span className="text-[#ffd700]">★ {formatNumber(reward.pointsCost)} pts each</span>
        {reward.quantity !== null && reward.quantity !== undefined && (
          <span className="text-[#ffd700]">★ Stock: {reward.quantity}</span>
        )}
      </div>

      {/* Max per order and Total */}
      <div className="flex items-center justify-between mb-4 text-sm text-[#c9a882]">
        <span>Max per order: {reward.redeemingLimit || 'Unlimited'}</span>
        <span>Total: {quantity}</span>
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={quantity <= 1 || isOutOfStock || isRedeeming}
          className="bg-[#5a3d2a] hover:bg-[#6b4d3a] disabled:bg-[#3d2817] disabled:opacity-50 text-white rounded-lg w-10 h-10 flex items-center justify-center transition-colors border border-[#2a1a10]"
        >
          <Minus className="h-5 w-5" />
        </button>
        <div className="bg-[#2a1a10] text-white font-bold text-xl rounded-lg w-12 h-10 flex items-center justify-center border border-[#1a0f08]">
          {quantity}
        </div>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={quantity >= maxQuantity || isOutOfStock || isRedeeming}
          className="bg-[#5a3d2a] hover:bg-[#6b4d3a] disabled:bg-[#3d2817] disabled:opacity-50 text-white rounded-lg w-10 h-10 flex items-center justify-center transition-colors border border-[#2a1a10]"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Order Button */}
      <Button
        type="button"
        onClick={handleRedeem}
        disabled={!canRedeem || isRedeeming}
        className={`w-full h-12 rounded-lg font-bold text-base transition-all ${
          canRedeem && !isRedeeming
            ? 'bg-[#e8a857] hover:bg-[#f5b967] text-[#2a1a10] border-2 border-[#b88a44]'
            : 'bg-gray-400 text-gray-600 cursor-not-allowed border-2 border-gray-500'
        }`}
      >
        {isRedeeming ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Ordering...
          </>
        ) : isOutOfStock ? (
          '❌ Out of Stock'
        ) : hasPendingRequest ? (
          '⏳ Pending Approval'
        ) : !canAfford ? (
          '💰 Insufficient Points'
        ) : (
          `🛒 Order (${formatNumber(totalCost)} pts)`
        )}
      </Button>

      {/* Status Badge if needed */}
      {(isOutOfStock || hasPendingRequest) && (
        <div className="mt-3 text-center text-xs">
          {isOutOfStock && <span className="text-red-400">● Out of Stock</span>}
          {hasPendingRequest && !isOutOfStock && (
            <span className="text-yellow-400">● Pending Approval</span>
          )}
        </div>
      )}
    </div>
  );
}
