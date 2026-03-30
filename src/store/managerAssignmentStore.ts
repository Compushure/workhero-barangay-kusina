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
  optimisticDeleteAssignment: (assignmentId: string) => void;
  optimisticDeleteTaskGroup: (criteria: {
    categoryId: string;
    deadlineDate: string;
    maxOrders: number;
    createdAt: string;
  }) => void;
  optimisticMergeAssignedTasks: (tasks: AssignedTask[]) => void;
  optimisticClearAll: () => void;
  optimisticClearUnstartedAssigned: () => void;
  optimisticClearUnstartedEmployeeTasks: (employeeId: string) => void;
  optimisticUpdateTask: (
    taskId: string,
    updates: { maxOrders?: number; newDueDate?: string; employeeIds?: string[] }
  ) => void;
}

function areAssignedTasksEquivalent(a: AssignedTask[], b: AssignedTask[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i += 1) {
    const left = a[i];
    const right = b[i];

    if (
      left.id !== right.id ||
      left.taskId !== right.taskId ||
      left.taskName !== right.taskName ||
      left.maxOrders !== right.maxOrders ||
      left.points !== right.points ||
      left.xp !== right.xp ||
      left.assignedEmployees.length !== right.assignedEmployees.length
    ) {
      return false;
    }
  }

  return true;
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
    if (areAssignedTasksEquivalent(get().assignedTasks, tasks)) return;
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
  optimisticDeleteAssignment: (assignmentId) =>
    set((state) => ({
      assignedTasks: state.assignedTasks
        .map((task) => ({
          ...task,
          assignedEmployees: task.assignedEmployees.filter(
            (employee) => employee.assignmentId !== assignmentId
          ),
        }))
        .filter((task) => task.assignedEmployees.length > 0),
    })),
  optimisticDeleteTaskGroup: ({ categoryId, deadlineDate, maxOrders, createdAt }) =>
    set((state) => ({
      assignedTasks: state.assignedTasks.filter(
        (task) =>
          !(
            task.taskId === categoryId &&
            (task.dateRange.end ?? '') === deadlineDate &&
            task.maxOrders === maxOrders &&
            task.dateRange.start === createdAt
          )
      ),
    })),
  optimisticMergeAssignedTasks: (tasks) =>
    set((state) => {
      const existing = [...state.assignedTasks];

      tasks.forEach((incomingTask) => {
        const matchedIndex = existing.findIndex(
          (currentTask) =>
            currentTask.taskId === incomingTask.taskId &&
            currentTask.dateRange.start === incomingTask.dateRange.start &&
            currentTask.dateRange.end === incomingTask.dateRange.end &&
            currentTask.maxOrders === incomingTask.maxOrders
        );

        if (matchedIndex < 0) {
          existing.push(incomingTask);
          return;
        }

        const matchedTask = existing[matchedIndex];
        const currentEmployees = matchedTask.assignedEmployees ?? [];
        const incomingEmployees = incomingTask.assignedEmployees ?? [];
        const employeeById = new Map(currentEmployees.map((employee) => [employee.id, employee]));

        incomingEmployees.forEach((employee) => {
          employeeById.set(employee.id, employee);
        });

        existing[matchedIndex] = {
          ...matchedTask,
          assignedEmployees: Array.from(employeeById.values()),
        };
      });

      return { assignedTasks: existing };
    }),
  optimisticClearAll: () => set({ assignedTasks: [] }),
  optimisticClearUnstartedAssigned: () =>
    set((state) => ({
      assignedTasks: state.assignedTasks
        .map((task) => ({
          ...task,
          assignedEmployees: task.assignedEmployees.filter(
            (emp) =>
              !(
                (emp.status?.trim().toLowerCase() ?? 'assigned') === 'assigned' &&
                (emp.completedOrders ?? 0) === 0 &&
                (emp.pendingOrders ?? 0) === 0
              )
          ),
        }))
        .filter((task) => task.assignedEmployees.length > 0),
    })),
  optimisticClearUnstartedEmployeeTasks: (employeeId) =>
    set((state) => ({
      assignedTasks: state.assignedTasks
        .map((task) => ({
          ...task,
          assignedEmployees: task.assignedEmployees.filter(
            (emp) =>
              !(
                emp.id === employeeId &&
                (emp.status?.trim().toLowerCase() ?? 'assigned') === 'assigned' &&
                (emp.completedOrders ?? 0) === 0 &&
                (emp.pendingOrders ?? 0) === 0
              )
          ),
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
