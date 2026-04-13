import { create } from 'zustand';
import type { Badge, BadgeCondition } from '@/types/manager/badge-editor';
import type { AddBadgeInput, EditBadgeInput } from '@/zod/schemas/badge';

// medgy same manag graypon sa admin user store honestly
interface ManagerBadgeEditorState {
  badges: Badge[];
  isOptimistic: boolean;
  snapshot: Badge[] | null;
  setBadges: (badges: Badge[]) => void;
  hydrateFromServer: (badges: Badge[]) => void;
  startOptimistic: () => void;
  commit: () => void;
  rollback: () => void;
  optimisticAddBadge: (input: AddBadgeInput) => void;
  optimisticUpdateBadge: (id: string, input: EditBadgeInput) => void;
  optimisticDeleteBadge: (id: string) => void;
}
// 👺👺
// STARTING TO THINK I SHOULD MAKE THIS A HELPERF CUNTION AND PUT SA UTILS GRRR

function areBadgesEquivalent(a: Badge[], b: Badge[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i += 1) {
    const left = a[i];
    const right = b[i];

    if (
      left.id !== right.id ||
      left.name !== right.name ||
      left.description !== right.description ||
      left.points !== right.points ||
      left.award_at_interval !== right.award_at_interval ||
      left.img_link !== right.img_link ||
      left.conditions.length !== right.conditions.length
    ) {
      return false;
    }
  }

  return true;
}

// converts input conditions into BadgeCondition objects.
// f a condition doesn’t have an id, generates a temporary optimistic ID.
// ensures every condition has a consistent shape for immediate UI rendering.

function toConditions(conditions: AddBadgeInput['conditions']): BadgeCondition[] {
  return conditions.map((condition, index) => ({
    // same temp id generation wla lang galing temp
    id: condition.id ?? `optimistic-condition-${Date.now()}-${index}`,
    requirement_type: condition.requirement_type,
    requirement_operator: condition.requirement_operator,
    requirement_attrb_id: condition.requirement_attrb_id,
    requirement_attrb_value: condition.requirement_attrb_value,
    logic_type: condition.logic_type,
  }));
}

export const useManagerBadgeEditorStore = create<ManagerBadgeEditorState>((set, get) => ({
  badges: [],
  isOptimistic: false,
  snapshot: null,

  setBadges: (badges) => set({ badges }),

  hydrateFromServer: (badges) => {
    if (get().isOptimistic) return;
    if (areBadgesEquivalent(get().badges, badges)) return;
    set({ badges });
  },

  startOptimistic: () => {
    if (!get().snapshot) {
      set({ snapshot: get().badges, isOptimistic: true });
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

    set({ badges: snapshot, snapshot: null, isOptimistic: false });
  },

  optimisticAddBadge: (input) =>
    set((state) => ({
      badges: [
        {
          id: `optimistic-badge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: input.name,
          description: input.description ?? null,
          points: input.points,
          award_at_interval: input.award_at_interval,
          img_link: input.img_link ?? null,
          created_at: new Date().toISOString(),
          created_by_name: 'You',
          conditions: toConditions(input.conditions),
        },
        ...state.badges,
      ],
    })),

  optimisticUpdateBadge: (id, input) =>
    set((state) => ({
      badges: state.badges.map((badge) =>
        badge.id === id
          ? {
              ...badge,
              name: input.name,
              description: input.description ?? null,
              points: input.points,
              award_at_interval: input.award_at_interval,
              img_link: input.img_link ?? null,
              conditions: toConditions(input.conditions),
            }
          : badge
      ),
    })),

  optimisticDeleteBadge: (id) =>
    set((state) => ({
      badges: state.badges.filter((badge) => badge.id !== id),
    })),
}));
