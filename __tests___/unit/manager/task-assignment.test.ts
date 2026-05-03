/**
 * Test coverage:
 * - Fetch task options for task-assignment card
 * - Fetch employee options for task-assignment card
 * - Assign task through card handler
 * - Guard/failure handling and notify=false behavior for assignment handler
 * Run this file only: npm test -- --runTestsByPath __tests___/unit/manager/task-assignment.test.ts
 */

import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
	handleAddTaskAssignment,
	handleFetchEmployeeList,
	handleFetchTaskList,
} from '@/action-handlers/manager/assignments';
import type { AssignedEmployee, AssignedTask, ServerActionResponse, Task } from '@/types';

type SafeActionResult<T> =
	| { success: true; data: T; error: null }
	| { success: false; data: null; error: string };

type FetchTaskListFn = () => Promise<ServerActionResponse<Task[]>>;
type FetchEmployeeListFn = () => Promise<ServerActionResponse<AssignedEmployee[]>>;
type AddTaskAssignmentFn = (
	taskId: string,
	employeeIds: string[],
	startDate: string,
	endDate: string,
	maxOrders?: number
) => Promise<ServerActionResponse<AssignedTask[]>>;

const fetchTaskListMock: jest.MockedFunction<FetchTaskListFn> = jest.fn();
const fetchEmployeeListMock: jest.MockedFunction<FetchEmployeeListFn> = jest.fn();
const addTaskAssignmentActionMock: jest.MockedFunction<AddTaskAssignmentFn> = jest.fn();
const safeActionMock: jest.Mock = jest.fn();

jest.mock('@/actions/manager/assignments', () => ({
	fetchTaskList: () => fetchTaskListMock(),
	fetchEmployeeList: () => fetchEmployeeListMock(),
	addTaskAssignmentAction: (
		taskId: string,
		employeeIds: string[],
		startDate: string,
		endDate: string,
		maxOrders?: number
	) => addTaskAssignmentActionMock(taskId, employeeIds, startDate, endDate, maxOrders),
}));

jest.mock('@/lib/utils/safe-action', () => ({
	safeAction: (...args: unknown[]) => safeActionMock(...args),
}));

jest.mock('sonner', () => ({
	toast: {
		success: jest.fn(),
		error: jest.fn(),
		info: jest.fn(),
	},
}));

const { toast } = jest.requireMock('sonner') as {
	toast: {
		success: jest.MockedFunction<(message?: unknown) => unknown>;
		error: jest.MockedFunction<(message?: unknown, options?: unknown) => unknown>;
		info: jest.MockedFunction<(message?: unknown, options?: unknown) => unknown>;
	};
};

const taskOptionMockData: Task = {
	id: 'category-1',
	name: 'Kitchen Checklist',
	type: 'daily',
	isRepeatable: true,
	points: 15,
	xp: 5,
	maxOrders: 1,
};

const employeeOptionMockData: AssignedEmployee = {
	id: 'employee-1',
	name: 'Employee One',
	empId: 'EMP-001',
	assignedTasks: [],
	pendingOrders: 0,
	completedOrders: 0,
};

const assignedTaskMockData: AssignedTask = {
	id: 'task-assignment-1',
	taskId: taskOptionMockData.id,
	taskName: taskOptionMockData.name,
	taskDescription: taskOptionMockData.type,
	isRepeatable: taskOptionMockData.isRepeatable,
	points: taskOptionMockData.points,
	xp: taskOptionMockData.xp,
	status: 'assigned',
	dateRange: {
		start: '2026-04-14T00:00:00.000Z',
		end: '2099-12-31',
	},
	maxOrders: 3,
	assignedEmployees: [employeeOptionMockData],
};

beforeEach(() => {
	fetchTaskListMock.mockReset();
	fetchEmployeeListMock.mockReset();
	addTaskAssignmentActionMock.mockReset();
	safeActionMock.mockReset();

	toast.success.mockReset();
	toast.error.mockReset();
	toast.info.mockReset();

	safeActionMock.mockImplementation(async (...args: unknown[]) => {
		const fn = args[0] as () => Promise<unknown>;
		try {
			const data = await fn();
			return { success: true, data, error: null } satisfies SafeActionResult<unknown>;
		} catch (error) {
			return {
				success: false,
				data: null,
				error: error instanceof Error ? error.message : 'An unexpected error occurred',
			} satisfies SafeActionResult<null>;
		}
	});
});

describe('When the manager loads task-assignment card options through handlers', () => {
	test('Then handleFetchTaskList returns available task options without showing an error toast', async () => {
		fetchTaskListMock.mockResolvedValue({
			error: null,
			data: [taskOptionMockData],
		});

		const tasks = await handleFetchTaskList();

		expect(tasks).toEqual([taskOptionMockData]);
		expect(toast.error).not.toHaveBeenCalled();
	});

	test('Then handleFetchEmployeeList returns available employee options without showing an error toast', async () => {
		fetchEmployeeListMock.mockResolvedValue({
			error: null,
			data: [employeeOptionMockData],
		});

		const employees = await handleFetchEmployeeList();

		expect(employees).toEqual([employeeOptionMockData]);
		expect(toast.error).not.toHaveBeenCalled();
	});
});

describe('When task-assignment card option handlers fail', () => {
	test('Then handleFetchTaskList returns an empty array and shows a prefixed safeAction error toast', async () => {
		safeActionMock.mockImplementationOnce(
			async () =>
				({
					success: false,
					data: null,
					error: 'network down',
				}) satisfies SafeActionResult<null>
		);

		const tasks = await handleFetchTaskList();

		expect(tasks).toEqual([]);
		expect(toast.error).toHaveBeenCalledWith('Failed to load tasks: network down');
	});

	test('Then handleFetchEmployeeList returns an empty array and shows action error toast', async () => {
		fetchEmployeeListMock.mockResolvedValue({
			error: 'Failed to fetch employees',
			data: undefined,
		});

		const employees = await handleFetchEmployeeList();

		expect(employees).toEqual([]);
		expect(toast.error).toHaveBeenCalledWith('Failed to fetch employees');
	});
});

describe('When the manager assigns tasks from the card through handlers', () => {
	test('Then handleAddTaskAssignment returns assigned tasks and shows success toast by default', async () => {
		addTaskAssignmentActionMock.mockResolvedValue({
			error: null,
			data: [assignedTaskMockData],
		});

		const assignedTasks = await handleAddTaskAssignment(
			'category-1',
			['employee-1'],
			'2026-04-14T00:00:00.000Z',
			'2099-12-31',
			3
		);

		expect(assignedTasks).toEqual([assignedTaskMockData]);
		expect(toast.success).toHaveBeenCalledWith('Task assigned successfully');
		expect(toast.error).not.toHaveBeenCalled();
	});

	test('Then handleAddTaskAssignment returns empty array and shows prefixed safeAction error toast when operation throws', async () => {
		safeActionMock.mockImplementationOnce(
			async () =>
				({
					success: false,
					data: null,
					error: 'request timeout',
				}) satisfies SafeActionResult<null>
		);

		const assignedTasks = await handleAddTaskAssignment(
			'category-1',
			['employee-1'],
			'2026-04-14T00:00:00.000Z',
			'2099-12-31',
			3
		);

		expect(assignedTasks).toEqual([]);
		expect(toast.error).toHaveBeenCalledWith('Failed to assign task: request timeout');
	});

	test('Then handleAddTaskAssignment returns empty array and shows action error toast when all employees are busy', async () => {
		addTaskAssignmentActionMock.mockResolvedValue({
			error: 'All selected employees are already assigned to an active instance of this task.',
			data: undefined,
		});

		const assignedTasks = await handleAddTaskAssignment(
			'category-1',
			['employee-1'],
			'2026-04-14T00:00:00.000Z',
			'2099-12-31',
			3
		);

		expect(assignedTasks).toEqual([]);
		expect(toast.error).toHaveBeenCalledWith(
			'All selected employees are already assigned to an active instance of this task.'
		);
	});

	test('Then handleAddTaskAssignment suppresses toasts when notify is false', async () => {
		addTaskAssignmentActionMock.mockResolvedValue({
			error: 'Maximum orders cannot exceed 99',
			data: undefined,
		});

		const assignedTasks = await handleAddTaskAssignment(
			'category-1',
			['employee-1'],
			'2026-04-14T00:00:00.000Z',
			'2099-12-31',
			100,
			{ notify: false }
		);

		expect(assignedTasks).toEqual([]);
		expect(toast.error).not.toHaveBeenCalled();
		expect(toast.success).not.toHaveBeenCalled();
	});
});
