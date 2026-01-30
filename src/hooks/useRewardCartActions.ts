import { useCallback } from 'react';
import { useCartStore } from '@/store/cartStore';
import type { Reward } from '@/types';

interface UseRewardCartActionsParams {
  reward: Reward;
  inCart: boolean;
  cartQuantity: number;
  localQuantity: number;
  setLocalQuantity: (quantity: number | ((prev: number) => number)) => void;
}

export function useRewardCartActions({
  reward,
  inCart,
  cartQuantity,
  localQuantity,
  setLocalQuantity,
}: UseRewardCartActionsParams) {
  const { addItem, updateQuantity, removeItem } = useCartStore();
  const maxQuantity = reward.redeemingLimit || 99;

  const handleAddToCart = useCallback(() => {
    addItem(reward, localQuantity);
    setLocalQuantity(1);
  }, [reward, localQuantity, addItem, setLocalQuantity]);

  const handleIncrementQuantity = useCallback(() => {
    if (inCart) {
      if (cartQuantity < maxQuantity) {
        updateQuantity(reward.id, cartQuantity + 1);
      }
    } else {
      if (localQuantity < maxQuantity) {
        setLocalQuantity(localQuantity + 1);
      }
    }
  }, [
    inCart,
    cartQuantity,
    localQuantity,
    maxQuantity,
    reward.id,
    updateQuantity,
    setLocalQuantity,
  ]);

  const handleDecrementQuantity = useCallback(() => {
    if (inCart) {
      if (cartQuantity > 1) {
        updateQuantity(reward.id, cartQuantity - 1);
      }
    } else {
      if (localQuantity > 1) {
        setLocalQuantity(localQuantity - 1);
      }
    }
  }, [inCart, cartQuantity, localQuantity, reward.id, updateQuantity, setLocalQuantity]);

  const handleQuantityChange = useCallback(
    (value: string) => {
      const val = parseInt(value) || 1;
      const clampedVal = Math.min(Math.max(val, 1), maxQuantity);

      if (inCart) {
        updateQuantity(reward.id, clampedVal);
      } else {
        setLocalQuantity(clampedVal);
      }
    },
    [inCart, maxQuantity, reward.id, updateQuantity, setLocalQuantity]
  );

  const handleRemoveFromCart = useCallback(() => {
    removeItem(reward.id);
  }, [reward.id, removeItem]);

  return {
    handleAddToCart,
    handleIncrementQuantity,
    handleDecrementQuantity,
    handleQuantityChange,
    handleRemoveFromCart,
  };
}
