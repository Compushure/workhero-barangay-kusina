import { create } from 'zustand';
import {
  applyOptimisticTaskClaim,
  applyOptimisticTaskRedo,
  applyOptimisticTaskVerification,
  areEmployeeTaskBoardsEquivalent,
  cloneEmployeeTaskBoardData,
  emptyEmployeeTaskBoardData,
  type EmployeeTaskBoardData,
} from '@/components/employee/task-status/task-status-data';

interface EmployeeTasksStore {
  tasks: EmployeeTaskBoardData;
  snapshot: EmployeeTaskBoardData | null;
  isOptimistic: boolean;
  hydrateFromServer: (tasks: EmployeeTaskBoardData) => void;
  setTasks: (tasks: EmployeeTaskBoardData) => void;
  startOptimistic: () => void;
  commit: () => void;
  rollback: () => void;
  optimisticSubmitTaskVerification: (taskId: string, pendingOrders: number) => void;
  optimisticRedoTask: (taskId: string) => void;
  optimisticClaimTaskRewards: (taskId: string) => void;
}

export const useEmployeeTasksStore = create<EmployeeTasksStore>((set, get) => ({
  tasks: cloneEmployeeTaskBoardData(emptyEmployeeTaskBoardData),
  snapshot: null,
  isOptimistic: false,
  hydrateFromServer: (tasks) => {
    if (get().isOptimistic) return;
    if (areEmployeeTaskBoardsEquivalent(get().tasks, tasks)) return;
    set({ tasks: cloneEmployeeTaskBoardData(tasks) });
  },
  setTasks: (tasks) => set({ tasks: cloneEmployeeTaskBoardData(tasks) }),
  startOptimistic: () => {
    if (get().isOptimistic) return;

    // Snapshots keep rollback cheap when a task action fails.
    set({
      snapshot: cloneEmployeeTaskBoardData(get().tasks),
      isOptimistic: true,
    });
  },
  commit: () => set({ snapshot: null, isOptimistic: false }),
  rollback: () => {
    const snapshot = get().snapshot;

    set({
      tasks: snapshot ? cloneEmployeeTaskBoardData(snapshot) : get().tasks,
      snapshot: null,
      isOptimistic: false,
    });
  },
  optimisticSubmitTaskVerification: (taskId, pendingOrders) =>
    set((state) => ({
      tasks: applyOptimisticTaskVerification(state.tasks, {
        taskId,
        pendingOrders,
      }),
    })),
  optimisticRedoTask: (taskId) =>
    set((state) => ({
      tasks: applyOptimisticTaskRedo(state.tasks, taskId),
    })),
  optimisticClaimTaskRewards: (taskId) =>
    set((state) => ({
      tasks: applyOptimisticTaskClaim(state.tasks, taskId),
    })),
}));
