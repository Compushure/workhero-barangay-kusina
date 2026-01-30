'use client';

import { useState, useMemo } from 'react';
import { useGetRewards } from '@/hooks/tanstack/queries/rewardQueries';
import { useGetMyRedemptionRequests } from '@/hooks/tanstack/queries/redemptionQueries';
import { getEmployeePoints } from '@/actions/employees/get-points';
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
import {
  ShoppingCart,
  Loader2,
  Minus,
  Plus,
  Check,
  ImageIcon,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/store/cartStore';
import { CartDrawer, CartButton } from '@/components/employee';
import { Reward } from '@/types';

function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  hasPendingRequest: boolean;
}

function RewardCard({ reward, userPoints, hasPendingRequest }: RewardCardProps) {
  const [imageError, setImageError] = useState(false);
  const { addItem, isInCart, getItemQuantity, updateQuantity, removeItem } = useCartStore();

  const inCart = isInCart(reward.id);
  const cartQuantity = getItemQuantity(reward.id);
  const maxQuantity = reward.redeemingLimit || 99;

  // Local quantity state for items not yet in cart
  const [localQuantity, setLocalQuantity] = useState(1);

  const displayQuantity = inCart ? cartQuantity : localQuantity;
  const totalCost = reward.pointsCost * displayQuantity;
  const canAfford = userPoints >= totalCost;
  const isOutOfStock = reward.quantity !== undefined && reward.quantity === 0;
  const canAddToCart = canAfford && !hasPendingRequest && !isOutOfStock;

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    addItem(reward, localQuantity);
    setLocalQuantity(1); // Reset local quantity after adding
  };

  const handleIncrementQuantity = () => {
    if (inCart) {
      if (cartQuantity < maxQuantity) {
        updateQuantity(reward.id, cartQuantity + 1);
      }
    } else {
      if (localQuantity < maxQuantity) {
        setLocalQuantity(localQuantity + 1);
      }
    }
  };

  const handleDecrementQuantity = () => {
    if (inCart) {
      if (cartQuantity > 1) {
        updateQuantity(reward.id, cartQuantity - 1);
      }
    } else {
      if (localQuantity > 1) {
        setLocalQuantity(localQuantity - 1);
      }
    }
  };

  const handleQuantityChange = (value: string) => {
    const val = parseInt(value) || 1;
    const clampedVal = Math.min(Math.max(val, 1), maxQuantity);

    if (inCart) {
      updateQuantity(reward.id, clampedVal);
    } else {
      setLocalQuantity(clampedVal);
    }
  };

  const handleRemoveFromCart = () => {
    removeItem(reward.id);
  };

  return (
    <Card
      className={`overflow-hidden border-[#690003]/20 hover:shadow-lg transition-shadow ${
        inCart ? 'ring-2 ring-[#690003]/40' : ''
      }`}
    >
      <CardHeader className="bg-gradient-to-br from-[#fff8f5] to-[#fbeaea] pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            {/* Item Image */}
            <div className="h-12 w-12 bg-[#f2e1c9] rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
              {reward.imageUrl && !imageError ? (
                <img
                  src={reward.imageUrl}
                  alt={reward.name}
                  className="h-full w-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <ImageIcon className="h-5 w-5 text-[#730202]/40" />
              )}
            </div>
            <CardTitle className="text-xl text-[#690003]">{reward.name}</CardTitle>
          </div>
          <div className="flex flex-col items-end gap-1">
            {inCart && (
              <Badge className="bg-[#690003] text-white text-xs">
                <Check className="h-3 w-3 mr-1" />
                In Cart
              </Badge>
            )}
            {reward.quantity !== undefined && reward.quantity <= 10 && reward.quantity > 0 && (
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800 border-yellow-300"
              >
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
          <CardDescription className="text-[#7a3d3d]">{reward.category}</CardDescription>
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

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#5a2a2a]">Quantity</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecrementQuantity}
                disabled={displayQuantity <= 1 || isOutOfStock}
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
                disabled={isOutOfStock}
                className="h-9 w-16 text-center border-[#690003] focus-visible:ring-[#690003]"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleIncrementQuantity}
                disabled={displayQuantity >= maxQuantity || isOutOfStock}
                className="h-9 w-9 border-[#690003] text-[#690003] hover:bg-[#fbeaea]"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Total Cost */}
          <div className="flex items-center justify-between pt-2 border-t border-[#690003]/10">
            <span className="text-sm font-medium text-[#7a3d3d]">Total Cost</span>
            <span className="text-2xl font-bold text-[#690003]">
              {formatNumber(totalCost)} <span className="text-sm font-normal">pts</span>
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-[#fff8f5] pt-4">
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

export default function EmployeeMercadoPage() {
  // Fetch active rewards
  const {
    data: allRewards = [],
    isLoading: rewardsLoading,
    error: rewardsError,
  } = useGetRewards();
  const activeRewards = useMemo(
    () => allRewards.filter((reward) => reward.isActive),
    [allRewards]
  );

  // Fetch user's pending redemption requests
  const { data: pendingRequests = [], isLoading: requestsLoading } =
    useGetMyRedemptionRequests('pending');

  // Fetch user's current points
  const { data: pointsData, isLoading: pointsLoading } = useQuery({
    queryKey: ['employeePoints'],
    queryFn: async () => {
      const result = await getEmployeePoints();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch points');
      }
      return result.data;
    },
  });

  const userPoints = pointsData ?? 0;

  // Cart state
  const { getTotalPoints, getTotalItems } = useCartStore();
  const cartTotalPoints = getTotalPoints();
  const cartTotalItems = getTotalItems();

  // Create a set of reward IDs with pending requests for quick lookup
  const pendingRewardIds = useMemo(
    () => new Set(pendingRequests.map((req) => req.rewardId)),
    [pendingRequests]
  );

  if (rewardsLoading || pointsLoading || requestsLoading) {
    return (
      <div className="min-h-screen bg-[#fff8f5] p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-[#690003]" />
              <p className="text-[#5a2a2a]">Loading mercado...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (rewardsError) {
    return (
      <div className="min-h-screen bg-[#fff8f5] p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <p className="text-red-600">Error loading rewards: {rewardsError.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f5] p-8 pb-24">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#690003]">Mercado</h1>
              <p className="text-[#7a3d3d] mt-1">
                Add rewards to your cart and submit your redemption request
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Cart Summary */}
              {cartTotalItems > 0 && (
                <div className="bg-white rounded-lg shadow-md px-4 py-3 border border-[#690003]/20">
                  <p className="text-xs text-[#7a3d3d] font-medium">Cart Total</p>
                  <p className="text-lg font-bold text-[#690003]">
                    {formatNumber(cartTotalPoints)} pts
                  </p>
                  <p className="text-xs text-[#7a3d3d]">{cartTotalItems} item(s)</p>
                </div>
              )}
              {/* Points Display */}
              <div className="bg-white rounded-lg shadow-md px-6 py-4 border-2 border-[#690003]">
                <p className="text-sm text-[#7a3d3d] font-medium">Your Points</p>
                <p className="text-3xl font-bold text-[#690003]">{formatNumber(userPoints)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Grid */}
        {activeRewards.length === 0 ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md">
            <p className="text-[#5a2a2a]">No rewards available at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeRewards.map((reward) => (
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

      {/* Floating Cart Button */}
      <CartButton variant="floating" />

      {/* Cart Drawer */}
      <CartDrawer userPoints={userPoints} />
    </div>
  );
}
