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

// same lng ni to avoid unencessary rehyrdation
function areBadgeAssignmentUsersEquivalent(
  a: BadgeAssignmentUser[],
  b: BadgeAssignmentUser[]
): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i += 1) {
    const left = a[i];
    const right = b[i];

    if (
      left.id !== right.id ||
      left.name !== right.name ||
      left.email !== right.email ||
      left.employee_id !== right.employee_id ||
      left.badge_ids.length !== right.badge_ids.length
    ) {
      return false;
    }

    for (let badgeIndex = 0; badgeIndex < left.badge_ids.length; badgeIndex += 1) {
      if (left.badge_ids[badgeIndex] !== right.badge_ids[badgeIndex]) {
        return false;
      }
    }
  }

  return true;
}


//Takes a list of users, a set of target user IDs, and a badge ID.
// Returns a new list where the target users get the badge appended to their badge_ids.

function applyBadge(users: BadgeAssignmentUser[], userIds: Set<string>, badgeId: string) {
  return users.map((user) => {
    if (!userIds.has(user.id) || user.badge_ids.includes(badgeId)) {
      return user;
    }

    // kay kung mag add ka it's the new badge plus ang existing badge na ka user
    // uses spread operator
    return {
      ...user,
      badge_ids: [...user.badge_ids, badgeId],
    };
  });
}

// same stuff lng ni sa admin nag different lnggamay
export const useManagerBadgeAssignmentStore = create<ManagerBadgeAssignmentState>((set, get) => ({
  users: [],
  isOptimistic: false,
  snapshot: null,

  setUsers: (users) => set({ users }),

  hydrateFromServer: (users) => {
    if (get().isOptimistic) return;
    if (areBadgeAssignmentUsersEquivalent(get().users, users)) return;
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
