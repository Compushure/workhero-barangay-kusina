import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Reward } from '@/types';

/**
 * Cart item representing a reward added to the cart
 */
export interface CartItem {
  rewardId: string;
  reward: Reward;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (reward: Reward, quantity: number) => void;
  removeItem: (rewardId: string) => void;
  updateQuantity: (rewardId: string, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;

  // Computed helpers
  getTotalPoints: () => number;
  getTotalItems: () => number;
  getItemQuantity: (rewardId: string) => number;
  isInCart: (rewardId: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (reward: Reward, quantity: number) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.rewardId === reward.id);

          if (existingItem) {
            // Update quantity if item exists
            return {
              items: state.items.map((item) =>
                item.rewardId === reward.id
                  ? { ...item, quantity: item.quantity + quantity, reward }
                  : item
              ),
            };
          }

          // Add new item
          return {
            items: [...state.items, { rewardId: reward.id, reward, quantity }],
          };
        });
      },

      removeItem: (rewardId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.rewardId !== rewardId),
        }));
      },

      updateQuantity: (rewardId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(rewardId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.rewardId === rewardId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      setIsOpen: (isOpen: boolean) => {
        set({ isOpen });
      },

      getTotalPoints: () => {
        return get().items.reduce(
          (total, item) => total + item.reward.pointsCost * item.quantity,
          0
        );
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getItemQuantity: (rewardId: string) => {
        const item = get().items.find((item) => item.rewardId === rewardId);
        return item?.quantity ?? 0;
      },

      isInCart: (rewardId: string) => {
        return get().items.some((item) => item.rewardId === rewardId);
      },
    }),
    {
      name: 'mercado-cart-storage',
      // Only persist the items, not UI state like isOpen
      partialize: (state) => ({ items: state.items }),
    }
  )
);
