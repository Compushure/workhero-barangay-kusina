import { create } from 'zustand';
import type { BadgeAssignmentUser } from '@/types/manager/badge-assignment';

interface ManagerBadgeAssignmentState {
  users: BadgeAssignmentUser[];
  isOptimistic: boolean;
  snapshot: BadgeAssignmentUser[] | null;
  setUsers: (users: BadgeAssignmentUser[]) => void;
  hydrateFromServer: (users: BadgeAssignmentUser[]) => void;
  startOptimistic: () => void;
  commit: () => void;
  rollback: () => void;
  optimisticAssignBadgeToUser: (userId: string, badgeId: string) => void;
  optimisticAssignBadgeToUsers: (userIds: string[], badgeId: string) => void;
}

function applyBadge(users: BadgeAssignmentUser[], userIds: Set<string>, badgeId: string) {
  return users.map((user) => {
    if (!userIds.has(user.id) || user.badge_ids.includes(badgeId)) {
      return user;
    }

    return {
      ...user,
      badge_ids: [...user.badge_ids, badgeId],
    };
  });
}

export const useManagerBadgeAssignmentStore = create<ManagerBadgeAssignmentState>((set, get) => ({
  users: [],
  isOptimistic: false,
  snapshot: null,

  setUsers: (users) => set({ users }),

  hydrateFromServer: (users) => {
    if (get().isOptimistic) return;
    set({ users });
  },

  startOptimistic: () => {
    if (!get().snapshot) {
      set({ snapshot: get().users, isOptimistic: true });
      return;
    }

    set({ isOptimistic: true });
  },

  commit: () => set({ snapshot: null, isOptimistic: false }),

  rollback: () => {
    const snapshot = get().snapshot;
    if (!snapshot) {
      set({ isOptimistic: false });
      return;
    }

    set({ users: snapshot, snapshot: null, isOptimistic: false });
  },

  optimisticAssignBadgeToUser: (userId, badgeId) =>
    set((state) => ({
      users: applyBadge(state.users, new Set([userId]), badgeId),
    })),

  optimisticAssignBadgeToUsers: (userIds, badgeId) =>
    set((state) => ({
      users: applyBadge(state.users, new Set(userIds), badgeId),
    })),
}));
