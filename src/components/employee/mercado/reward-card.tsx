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
import { ShoppingCart, Minus, Plus, Check, ImageIcon } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useRewardCartActions } from '@/hooks/useRewardCartActions';
import { formatNumber } from '@/lib/format';
import type { Reward } from '@/types';

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  hasPendingRequest: boolean;
}

export function RewardCard({ reward, userPoints, hasPendingRequest }: RewardCardProps) {
  const [imageError, setImageError] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(1);
  const { isInCart, getItemQuantity } = useCartStore();

  const inCart = isInCart(reward.id);
  const cartQuantity = getItemQuantity(reward.id);
  const maxQuantity = reward.redeemingLimit || 99;
  const displayQuantity = inCart ? cartQuantity : localQuantity;
  const totalCost = reward.pointsCost * displayQuantity;
  const canAfford = userPoints >= totalCost;
  const isOutOfStock = reward.quantity !== undefined && reward.quantity === 0;
  const canAddToCart = canAfford && !hasPendingRequest && !isOutOfStock;

  const {
    handleAddToCart,
    handleIncrementQuantity,
    handleDecrementQuantity,
    handleQuantityChange,
    handleRemoveFromCart,
  } = useRewardCartActions({
    reward,
    inCart,
    cartQuantity,
    localQuantity,
    setLocalQuantity,
  });

  return (
    <Card
      className={`overflow-hidden border-[#690003]/20 hover:shadow-lg transition-shadow ${
        inCart ? 'ring-2 ring-[#690003]/40' : ''
      }`}
    >
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
            {inCart && (
              <Badge className="bg-gray-700 text-white text-xs">
                <Check className="h-3 w-3 mr-1" />
                In Cart
              </Badge>
            )}
            {reward.quantity !== undefined && reward.quantity <= 10 && reward.quantity > 0 && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                Only {reward.quantity} left
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                Out of Stock
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
            <div
              className={`flex items-center gap-3 ${inCart ? 'pointer-events-none opacity-60' : ''}`}
              aria-disabled={inCart}
            >
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecrementQuantity}
                disabled={displayQuantity <= 1 || isOutOfStock || inCart}
                className="h-9 w-9 border-[#690003] text-[#690003] hover:bg-[#fbeaea]"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="1"
                max={maxQuantity}
                value={displayQuantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                disabled={isOutOfStock || inCart}
                className="h-9 w-16 text-center border-[#690003] focus-visible:ring-[#690003]"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleIncrementQuantity}
                disabled={displayQuantity >= maxQuantity || isOutOfStock || inCart}
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
        {inCart ? (
          <div className="w-full flex gap-2">
            <Button
              onClick={handleRemoveFromCart}
              variant="outline"
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            >
              Remove from Cart
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className={`w-full ${
              canAddToCart
                ? 'bg-[#690003] hover:bg-[#8b0000] text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isOutOfStock ? (
              'Out of Stock'
            ) : hasPendingRequest ? (
              'Pending Approval'
            ) : !canAfford ? (
              'Insufficient Points'
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
