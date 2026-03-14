import { create } from 'zustand';
import type { RedemptionRequest } from '@/types';

interface HrRedemptionRequestState {
  requests: RedemptionRequest[];
  snapshot: RedemptionRequest[] | null;
  isOptimistic: boolean;
  hydrateFromServer: (requests: RedemptionRequest[]) => void;
  startOptimistic: () => void;
  commit: () => void;
  rollback: () => void;
  optimisticRemoveRequest: (id: string) => void;
}

function areRequestsEquivalent(a: RedemptionRequest[], b: RedemptionRequest[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i += 1) {
    const left = a[i];
    const right = b[i];

    if (
      left.id !== right.id ||
      left.status !== right.status ||
      left.remarks !== right.remarks ||
      left.requestedAt !== right.requestedAt
    ) {
      return false;
    }
  }

  return true;
}

export const useHrRedemptionRequestStore = create<HrRedemptionRequestState>((set) => ({
  requests: [],
  snapshot: null,
  isOptimistic: false,
  hydrateFromServer: (requests) =>
    set((state) => {
      if (state.isOptimistic) return state;
      if (areRequestsEquivalent(state.requests, requests)) return state;
      return { requests };
    }),
  startOptimistic: () =>
    set((state) =>
      state.isOptimistic
        ? state
        : {
            snapshot: state.requests,
            isOptimistic: true,
          }
    ),
  commit: () => set({ snapshot: null, isOptimistic: false }),
  rollback: () =>
    set((state) => ({
      requests: state.snapshot ?? state.requests,
      snapshot: null,
      isOptimistic: false,
    })),
  optimisticRemoveRequest: (id) =>
    set((state) => ({
      requests: state.requests.filter((request) => request.id !== id),
    })),
}));
