import type { EmployeeTasksData } from '@/actions/employee/tasks';
import type { TaskStatusItem } from '@/components/employee/task-status/types';

const baseTask: TaskStatusItem = {
  id: 'task-base',
  name: 'Kitchen Task',
  description: 'Kitchen Task',
  pendingOrders: 0,
  completedOrders: 0,
  maxOrders: 3,
  claimedOrders: 0,
  points: 10,
  xp: 5,
  dueDate: '2099-12-31',
  approvedAt: '2026-04-10T08:00:00.000Z',
  status: 'assigned',
};

export function createTaskStatusItemMock(
  overrides: Partial<TaskStatusItem> = {}
): TaskStatusItem {
  return {
    ...baseTask,
    ...overrides,
  };
}

export const employeeTaskStatusMockData = {
  assigned: createTaskStatusItemMock({
    id: 'task-assigned',
    status: 'assigned',
    pendingOrders: 0,
    completedOrders: 1,
    maxOrders: 3,
    claimedOrders: 1,
    points: 12,
    xp: 4,
    name: 'Assigned Task',
    description: 'Assigned Task Description',
  }),
  inReview: createTaskStatusItemMock({
    id: 'task-review',
    status: 'in review',
    pendingOrders: 2,
    completedOrders: 1,
    maxOrders: 4,
    claimedOrders: 1,
    points: 8,
    xp: 3,
    name: 'In Review Task',
  }),
  approvedClaimable: createTaskStatusItemMock({
    id: 'task-approved-claimable',
    status: 'approved',
    pendingOrders: 1,
    completedOrders: 1,
    maxOrders: 3,
    claimedOrders: 0,
    points: 20,
    xp: 7,
    name: 'Approved Claimable Task',
  }),
  approvedPrepareReady: createTaskStatusItemMock({
    id: 'task-approved-ready',
    status: 'approved',
    pendingOrders: 0,
    completedOrders: 3,
    maxOrders: 3,
    claimedOrders: 3,
    claimedAt: '2026-04-15T12:00:00.000Z',
    points: 15,
    xp: 5,
    name: 'Approved Prepare Task',
    cookDishName: 'Sinigang',
    cookDishImageUrl: '/assets/dish/food-sinigang.png',
    cookOrderCount: 3,
  }),
  rejected: createTaskStatusItemMock({
    id: 'task-rejected',
    status: 'rejected',
    pendingOrders: 0,
    completedOrders: 0,
    maxOrders: 2,
    claimedOrders: 0,
    points: 6,
    xp: 2,
    name: 'Rejected Task',
    remark: 'Needs better plating',
  }),
};

export const employeeTasksDataMock: EmployeeTasksData = {
  currentTasks: [employeeTaskStatusMockData.assigned],
  onReviewTasks: [employeeTaskStatusMockData.inReview],
  verifiedTasks: [employeeTaskStatusMockData.approvedClaimable],
  deniedTasks: [employeeTaskStatusMockData.rejected],
};
