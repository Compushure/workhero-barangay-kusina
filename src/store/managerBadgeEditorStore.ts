import { create } from 'zustand';
import type { Badge, BadgeCondition } from '@/types/manager/badge-editor';
import type { AddBadgeInput, EditBadgeInput } from '@/zod/schemas/badge';

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

function toConditions(conditions: AddBadgeInput['conditions']): BadgeCondition[] {
  return conditions.map((condition, index) => ({
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
