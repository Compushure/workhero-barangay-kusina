import type { AssignedTask } from '@/types';

export function createAssignedTaskMockData(taskId: string, employeeId: string): AssignedTask {
  return {
    id: taskId,
    taskId: 'category-1',
    taskName: 'Kitchen Checklist',
    taskDescription: 'Daily checklist',
    isRepeatable: true,
    points: 15,
    xp: 5,
    status: 'assigned',
    dateRange: {
      start: '2026-04-01T00:00:00.000Z',
      end: '2099-12-31',
    },
    maxOrders: 3,
    assignedEmployees: [
      {
        assignmentId: taskId,
        id: employeeId,
        name: 'Employee Seed',
        empId: 'EMP-001',
        assignedTasks: [],
        completedOrders: 0,
        pendingOrders: 1,
        status: 'assigned',
      },
    ],
  };
}

export const managerAssignedTasksIntegrationNames = {
  load: {
    managerNamePrefix: 'Assigned Tasks Manager',
    managerEmailPrefix: 'assigned.tasks.manager',
    employeeNamePrefix: 'Assigned Tasks Employee',
    employeeEmailPrefix: 'assigned.tasks.employee',
    employeeIdPrefix: 'ASSIGN-EMP',
    categoryNamePrefix: 'Assigned Tasks Category',
  },
  clear: {
    managerNamePrefix: 'Clear Assigned Manager',
    managerEmailPrefix: 'clear.assigned.manager',
    employeeNamePrefix: 'Clear Assigned Employee',
    employeeEmailPrefix: 'clear.assigned.employee',
    categoryNamePrefix: 'Clear Assigned Category',
  },
  delete: {
    managerNamePrefix: 'Delete Assigned Manager',
    managerEmailPrefix: 'delete.assigned.manager',
    employeeNamePrefix: 'Delete Assigned Employee',
    employeeEmailPrefix: 'delete.assigned.employee',
    categoryNamePrefix: 'Delete Assigned Category',
  },
};
