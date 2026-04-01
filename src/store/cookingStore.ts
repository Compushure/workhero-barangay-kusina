'use client';

import { create } from 'zustand';

export interface CookingLaunchPayload {
  taskId: string;
  taskName: string;
  dishName: string;
  dishImageUrl: string | null;
  orderCount: number;
  maxOrders: number;
}

interface CookingState {
  trigger: CookingLaunchPayload | null;
  triggerVersion: number;
  launchCooking: (payload: CookingLaunchPayload) => void;
  clearCooking: () => void;
}

export const useCookingStore = create<CookingState>((set) => ({
  trigger: null,
  triggerVersion: 0,
  launchCooking: (payload) =>
    set((state) => ({
      trigger: payload,
      triggerVersion: state.triggerVersion + 1,
    })),
  clearCooking: () => set({ trigger: null }),
}));
