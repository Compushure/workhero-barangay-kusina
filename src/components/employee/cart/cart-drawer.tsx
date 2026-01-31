'use client';

import { useState } from 'react';
import { Trash2, Minus, Plus, ShoppingCart, Loader2, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCartStore, CartItem } from '@/store/cartStore';
import { useSubmitCart } from '@/hooks/tanstack/mutations/cartMutations';
import { formatNumber } from '@/lib/format';

interface CartDrawerProps {
  userPoints: number;
  deductedPoints?: number;
}

function CartItemRow({
  item,
  userPoints,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  userPoints: number;
  onUpdateQuantity: (rewardId: string, quantity: number) => void;
  onRemove: (rewardId: string) => void;
}) {
  const [imageError, setImageError] = useState(false);
  const maxQuantity = item.reward.redeemingLimit || 99;
  const itemTotal = item.reward.pointsCost * item.quantity;
  const canAfford = userPoints >= itemTotal;

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg border ${
        canAfford ? 'border-[#690003]/10 bg-white' : 'border-red-300 bg-red-50'
      }`}
    >
      {/* Item Image */}
      <div className="h-16 w-16 bg-[#f2e1c9] rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
        {item.reward.imageUrl && !imageError ? (
          <img
            src={item.reward.imageUrl}
            alt={item.reward.name}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <ImageIcon className="h-6 w-6 text-[#730202]/40" />
        )}
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-[#690003] truncate">{item.reward.name}</h4>
        <p className="text-sm text-[#7a3d3d]">{formatNumber(item.reward.pointsCost)} pts each</p>
        {!canAfford && (
          <p className="text-xs text-red-600 mt-1">Insufficient points for this item</p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-[#690003] text-[#690003] hover:bg-[#fbeaea]"
          onClick={() => onUpdateQuantity(item.rewardId, item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center font-medium text-[#690003]">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-[#690003] text-[#690003] hover:bg-[#fbeaea]"
          onClick={() => onUpdateQuantity(item.rewardId, item.quantity + 1)}
          disabled={item.quantity >= maxQuantity}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Item Total */}
      <div className="text-right min-w-[80px]">
        <p className="font-bold text-[#690003]">{formatNumber(itemTotal)} pts</p>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
        onClick={() => onRemove(item.rewardId)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function CartDrawer({ userPoints, deductedPoints = 0 }: CartDrawerProps) {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, clearCart, getTotalPoints } =
    useCartStore();
  const submitCartMutation = useSubmitCart();

  const totalPoints = getTotalPoints();
  const canAffordTotal = userPoints >= totalPoints;
  const hasItems = items.length > 0;

  const handleSubmitCart = async () => {
    if (!canAffordTotal || !hasItems) return;

    try {
      await submitCartMutation.mutateAsync(items);
      clearCart();
      setIsOpen(false);
    } catch (error) {
      // Error handled by mutation
      console.error('Failed to submit cart:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl max-h-[var(--dialog-max-height)] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#690003]">
            <ShoppingCart className="h-5 w-5" />
            Your Cart
          </DialogTitle>
          <DialogDescription>
            Review your selected rewards before submitting your redemption request.
          </DialogDescription>
        </DialogHeader>

        {/* Points Display */}
        <div className="flex items-center justify-between bg-[#fff8f5] rounded-lg p-4 border border-[#690003]/20">
          <div>
            <p className="text-sm text-[#7a3d3d]">Available Points</p>
            <p className="text-2xl font-bold text-[#690003]">{formatNumber(userPoints)}</p>
            {deductedPoints > 0 && (
              <p className="text-xs text-orange-600 mt-1">
                Pending: {formatNumber(deductedPoints)} pts
              </p>
            )}
          </div>
          {hasItems && (
            <div className="text-right">
              <p className="text-sm text-[#7a3d3d]">Cart Total</p>
              <p
                className={`text-2xl font-bold ${canAffordTotal ? 'text-[#690003]' : 'text-red-600'}`}
              >
                {formatNumber(totalPoints)} pts
              </p>
            </div>
          )}
        </div>

        {/* Cart Items */}
        {hasItems ? (
          <div className={`${items.length > 3 ? 'max-h-[280px] overflow-y-auto' : ''}`}>
            <div className="space-y-3 pr-4">
              {items.map((item) => (
                <CartItemRow
                  key={item.rewardId}
                  item={item}
                  userPoints={userPoints}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <ShoppingCart className="h-12 w-12 text-[#690003]/30 mx-auto mb-4" />
              <p className="text-[#7a3d3d]">Your cart is empty</p>
              <p className="text-sm text-[#7a3d3d]/70 mt-1">
                Add some rewards from the Mercado to get started
              </p>
            </div>
          </div>
        )}

        {/* Summary and Actions */}
        {hasItems && (
          <>
            <div className="border-t border-[#690003]/10 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#7a3d3d]">Total Items</span>
                <span className="font-medium text-[#690003]">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#7a3d3d] font-medium">Total Cost</span>
                <span
                  className={`text-xl font-bold ${canAffordTotal ? 'text-[#690003]' : 'text-red-600'}`}
                >
                  {formatNumber(totalPoints)} pts
                </span>
              </div>
              {!canAffordTotal && (
                <p className="text-sm text-red-600 mt-2">
                  You don&apos;t have enough points. Remove some items or reduce quantities.
                </p>
              )}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#690003]/10">
                <span className="text-[#7a3d3d]">Remaining Points</span>
                <span
                  className={`font-medium ${userPoints - totalPoints >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatNumber(Math.max(0, userPoints - totalPoints))} pts
                </span>
              </div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={clearCart}
                className="border-[#690003] text-[#690003] hover:bg-[#fbeaea]"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Cart
              </Button>
              <Button
                onClick={handleSubmitCart}
                disabled={!canAffordTotal || submitCartMutation.isPending}
                className="bg-[#690003] hover:bg-[#8b0000] text-white"
              >
                {submitCartMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Submit Request ({formatNumber(totalPoints)} pts)
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
