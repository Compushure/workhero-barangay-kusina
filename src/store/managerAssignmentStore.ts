import { create } from 'zustand';
import type { AssignedTask, AssignedEmployee } from '@/types';

interface ManagerAssignmentState {
  assignedTasks: AssignedTask[];
  isOptimistic: boolean;
  snapshot: AssignedTask[] | null;
  setAssignedTasks: (tasks: AssignedTask[]) => void;
  updateAssignedTasks: (updater: (tasks: AssignedTask[]) => AssignedTask[]) => void;
  appendAssignedTasks: (tasks: AssignedTask[]) => void;
  hydrateFromServer: (tasks: AssignedTask[]) => void;
  startOptimistic: () => void;
  commit: () => void;
  rollback: () => void;
  optimisticDeleteTask: (taskId: string) => void;
  optimisticClearAll: () => void;
  optimisticClearAllEmployeeTasks: (employeeId: string) => void;
  optimisticUpdateTask: (
    taskId: string,
    updates: { maxOrders?: number; newDueDate?: string; employeeIds?: string[] }
  ) => void;
}

const buildOptimisticEmployees = (
  existingEmployees: AssignedEmployee[],
  employeeIds: string[]
): AssignedEmployee[] => {
  const byId = new Map(existingEmployees.map((emp) => [emp.id, emp]));
  return employeeIds.map((id) => {
    const found = byId.get(id);
    if (found) return found;
    return {
      id,
      name: 'Pending...',
      empId: 'Pending...',
      assignedTasks: [],
      completedOrders: 0,
      status: 'pending',
    } as AssignedEmployee;
  });
};

export const useManagerAssignmentStore = create<ManagerAssignmentState>((set, get) => ({
  assignedTasks: [],
  isOptimistic: false,
  snapshot: null,
  setAssignedTasks: (tasks) => set({ assignedTasks: tasks }),
  updateAssignedTasks: (updater) =>
    set((state) => ({ assignedTasks: updater(state.assignedTasks) })),
  appendAssignedTasks: (tasks) =>
    set((state) => ({ assignedTasks: [...state.assignedTasks, ...tasks] })),
  hydrateFromServer: (tasks) => {
    if (get().isOptimistic) return;
    set({ assignedTasks: tasks });
  },
  startOptimistic: () => {
    if (!get().snapshot) {
      set({ snapshot: get().assignedTasks, isOptimistic: true });
    } else {
      set({ isOptimistic: true });
    }
  },
  commit: () => set({ snapshot: null, isOptimistic: false }),
  rollback: () => {
    const snapshot = get().snapshot;
    if (snapshot) {
      set({ assignedTasks: snapshot, snapshot: null, isOptimistic: false });
    } else {
      set({ isOptimistic: false });
    }
  },
  optimisticDeleteTask: (taskId) =>
    set((state) => ({
      assignedTasks: state.assignedTasks.filter((task) => task.id !== taskId),
    })),
  optimisticClearAll: () => set({ assignedTasks: [] }),
  optimisticClearAllEmployeeTasks: (employeeId) =>
    set((state) => ({
      assignedTasks: state.assignedTasks
        .map((task) => ({
          ...task,
          assignedEmployees: task.assignedEmployees.filter((emp) => emp.id !== employeeId),
        }))
        .filter((task) => task.assignedEmployees.length > 0),
    })),
  optimisticUpdateTask: (taskId, updates) =>
    set((state) => ({
      assignedTasks: state.assignedTasks
        .map((task) => {
          if (task.id !== taskId) return task;
          const updatedEmployees = updates.employeeIds
            ? buildOptimisticEmployees(task.assignedEmployees, updates.employeeIds)
            : task.assignedEmployees;
          return {
            ...task,
            maxOrders: updates.maxOrders ?? task.maxOrders,
            dateRange: updates.newDueDate
              ? { ...task.dateRange, end: updates.newDueDate }
              : task.dateRange,
            assignedEmployees: updatedEmployees,
          };
        })
        .filter((task) => task.assignedEmployees.length > 0),
    })),
}));
