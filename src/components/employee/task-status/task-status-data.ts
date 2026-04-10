import type { TaskStatusItem } from './types';

export interface EmployeeTaskBoardData {
  currentTasks: TaskStatusItem[];
  inReviewTasks: TaskStatusItem[];
  verifiedTasks: TaskStatusItem[];
  rejectedTasks: TaskStatusItem[];
}

export interface EmployeeTasksQueryShape {
  currentTasks: TaskStatusItem[];
  onReviewTasks: TaskStatusItem[];
  verifiedTasks: TaskStatusItem[];
  deniedTasks: TaskStatusItem[];
}

export interface OptimisticTaskVerificationInput {
  taskId: string;
  pendingOrders: number;
}

export const emptyEmployeeTaskBoardData: EmployeeTaskBoardData = {
  currentTasks: [],
  inReviewTasks: [],
  verifiedTasks: [],
  rejectedTasks: [],
};

function cloneTasks(tasks: TaskStatusItem[]): TaskStatusItem[] {
  return tasks.map((task) => ({ ...task }));
}

export function cloneEmployeeTaskBoardData(data: EmployeeTaskBoardData): EmployeeTaskBoardData {
  return {
    currentTasks: cloneTasks(data.currentTasks),
    inReviewTasks: cloneTasks(data.inReviewTasks),
    verifiedTasks: cloneTasks(data.verifiedTasks),
    rejectedTasks: cloneTasks(data.rejectedTasks),
  };
}

function areTaskArraysEquivalent(left: TaskStatusItem[], right: TaskStatusItem[]): boolean {
  if (left === right) return true;
  if (left.length !== right.length) return false;

  for (let index = 0; index < left.length; index += 1) {
    const leftTask = left[index];
    const rightTask = right[index];

    if (
      leftTask.id !== rightTask.id ||
      leftTask.status !== rightTask.status ||
      leftTask.pendingOrders !== rightTask.pendingOrders ||
      leftTask.completedOrders !== rightTask.completedOrders ||
      leftTask.maxOrders !== rightTask.maxOrders ||
      leftTask.claimedAt !== rightTask.claimedAt ||
      leftTask.remark !== rightTask.remark ||
      leftTask.dueDate !== rightTask.dueDate
    ) {
      return false;
    }
  }

  return true;
}

export function areEmployeeTaskBoardsEquivalent(
  left: EmployeeTaskBoardData,
  right: EmployeeTaskBoardData
): boolean {
  return (
    areTaskArraysEquivalent(left.currentTasks, right.currentTasks) &&
    areTaskArraysEquivalent(left.inReviewTasks, right.inReviewTasks) &&
    areTaskArraysEquivalent(left.verifiedTasks, right.verifiedTasks) &&
    areTaskArraysEquivalent(left.rejectedTasks, right.rejectedTasks)
  );
}

export function toEmployeeTaskBoardData(
  data: EmployeeTasksQueryShape | null | undefined
): EmployeeTaskBoardData {
  if (!data) {
    return cloneEmployeeTaskBoardData(emptyEmployeeTaskBoardData);
  }

  return {
    currentTasks: cloneTasks(data.currentTasks ?? []),
    inReviewTasks: cloneTasks(data.onReviewTasks ?? []),
    verifiedTasks: cloneTasks(data.verifiedTasks ?? []),
    rejectedTasks: cloneTasks(data.deniedTasks ?? []),
  };
}

export function toEmployeeTasksQueryData(data: EmployeeTaskBoardData): EmployeeTasksQueryShape {
  return {
    currentTasks: cloneTasks(data.currentTasks),
    onReviewTasks: cloneTasks(data.inReviewTasks),
    verifiedTasks: cloneTasks(data.verifiedTasks),
    deniedTasks: cloneTasks(data.rejectedTasks),
  };
}

function prependTask(tasks: TaskStatusItem[], nextTask: TaskStatusItem): TaskStatusItem[] {
  return [nextTask, ...tasks.filter((task) => task.id !== nextTask.id)];
}

export function applyOptimisticTaskVerification(
  data: EmployeeTaskBoardData,
  { taskId, pendingOrders }: OptimisticTaskVerificationInput
): EmployeeTaskBoardData {
  const currentIndex = data.currentTasks.findIndex((task) => task.id === taskId);

  if (currentIndex < 0) {
    return data;
  }

  const nextData = cloneEmployeeTaskBoardData(data);
  const [currentTask] = nextData.currentTasks.splice(currentIndex, 1);

  if (!currentTask) {
    return data;
  }

  nextData.inReviewTasks = prependTask(nextData.inReviewTasks, {
    ...currentTask,
    pendingOrders,
    status: 'in review',
  });

  return nextData;
}

export function applyOptimisticTaskRedo(
  data: EmployeeTaskBoardData,
  taskId: string
): EmployeeTaskBoardData {
  const rejectedIndex = data.rejectedTasks.findIndex((task) => task.id === taskId);

  if (rejectedIndex < 0) {
    return data;
  }

  const nextData = cloneEmployeeTaskBoardData(data);
  const [rejectedTask] = nextData.rejectedTasks.splice(rejectedIndex, 1);

  if (!rejectedTask) {
    return data;
  }

  nextData.currentTasks = prependTask(nextData.currentTasks, {
    ...rejectedTask,
    pendingOrders: 0,
    status: 'assigned',
  });

  return nextData;
}

export function applyOptimisticTaskClaim(
  data: EmployeeTaskBoardData,
  taskId: string
): EmployeeTaskBoardData {
  const verifiedIndex = data.verifiedTasks.findIndex((task) => task.id === taskId);

  if (verifiedIndex < 0) {
    return data;
  }

  const nextData = cloneEmployeeTaskBoardData(data);
  const existingTask = nextData.verifiedTasks[verifiedIndex];

  if (!existingTask) {
    return data;
  }

  const claimedTask: TaskStatusItem = {
    ...existingTask,
    claimedAt: new Date().toISOString(),
    pendingOrders: 0,
    status: 'approved',
  };

  nextData.verifiedTasks.splice(verifiedIndex, 1, claimedTask);

  return nextData;
}

export function applyOptimisticPerformMoreOrders(
  data: EmployeeTaskBoardData,
  taskId: string
): EmployeeTaskBoardData {
  const verifiedIndex = data.verifiedTasks.findIndex((task) => task.id === taskId);

  if (verifiedIndex < 0) {
    return data;
  }

  const nextData = cloneEmployeeTaskBoardData(data);
  const [verifiedTask] = nextData.verifiedTasks.splice(verifiedIndex, 1);

  if (!verifiedTask) {
    return data;
  }

  nextData.currentTasks = prependTask(nextData.currentTasks, {
    ...verifiedTask,
    status: 'assigned',
    pendingOrders: 0,
  });

  return nextData;
}
