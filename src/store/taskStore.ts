import { create } from 'zustand';
import type { VerificationRequest } from '@/types';

interface TaskState {
  tasks: VerificationRequest[];
  snapshot: VerificationRequest[] | null;
  isOptimistic: boolean;
  hydrateFromServer: (tasks: VerificationRequest[]) => void;
  startOptimistic: () => void;
  commit: () => void;
  rollback: () => void;
  setTasks: (tasks: VerificationRequest[]) => void;
  optimisticApprove: (id: string) => void;
  optimisticReject: (id: string) => void;
  updateTask: (id: string, updates: Partial<VerificationRequest>) => void;
}

function areVerificationTasksEquivalent(a: VerificationRequest[], b: VerificationRequest[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i += 1) {
    const left = a[i];
    const right = b[i];

    if (
      left.kpitask_id !== right.kpitask_id ||
      left.status !== right.status ||
      left.assigned_to_name !== right.assigned_to_name ||
      left.assigned_to_employee_id !== right.assigned_to_employee_id
    ) {
      return false;
    }
  }

  return true;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  snapshot: null,
  isOptimistic: false,
  hydrateFromServer: (tasks: VerificationRequest[]) =>
    set((state) => {
      if (state.isOptimistic) return state;
      if (areVerificationTasksEquivalent(state.tasks, tasks)) return state;
      return { tasks };
    }),
  startOptimistic: () =>
    set((state) =>
      state.isOptimistic
        ? state
        : { snapshot: state.tasks, isOptimistic: true }
    ),
  commit: () => set({ snapshot: null, isOptimistic: false }),
  rollback: () =>
    set((state) => ({
      tasks: state.snapshot ?? state.tasks,
      snapshot: null,
      isOptimistic: false,
    })),
  setTasks: (tasks: VerificationRequest[]) => set({ tasks }),
  optimisticApprove: (id: string) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.kpitask_id !== id),
    })),
  optimisticReject: (id: string) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.kpitask_id !== id),
    })),
  updateTask: (id: string, updates: Partial<VerificationRequest>) =>
    set((state) => ({
      tasks: state.tasks.map((task) => (task.kpitask_id === id ? { ...task, ...updates } : task)),
    })),
}));
