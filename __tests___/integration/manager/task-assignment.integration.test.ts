/**
 *  WARNING: MAKE SURE YOU HAVE THE RIGHT ENV FOR THE TEST DB DIOS MIOKO
 * Test coverage:
 * - Load remote task-assignment card options (tasks and employees)
 * - Assign remote tasks to employees from the task-assignment card
 * - Partial assignment when some employees are already busy on the same task
 * - Rejected assignment when all selected employees are already busy
 * Run this file only: npm test -- --runTestsByPath __tests___/integration/manager/task-assignment.integration.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
	handleAddTaskAssignment,
	handleFetchEmployeeList,
	handleFetchTaskList,
} from '@/action-handlers/manager/assignments';
import { RemoteSupabaseTestContext } from '../../utils/remoteSupabaseTestUtils';
import { managerTaskAssignmentIntegrationNames } from '../../mockData/managerTaskAssignmentMockData';

type ServerClient = ReturnType<RemoteSupabaseTestContext['createServerClientForUser']>;
let currentServerClient: ServerClient;

const toastSuccess = jest.fn();
const toastError = jest.fn();
const remoteContext = new RemoteSupabaseTestContext('manager-task-assignment');

jest.setTimeout(90000);

jest.mock('@/lib/supabase/server', () => ({
	createClient: jest.fn(async () => currentServerClient),
}));

jest.mock('sonner', () => ({
	toast: {
		success: (...args: unknown[]) => toastSuccess(...args),
		error: (...args: unknown[]) => toastError(...args),
	},
}));

beforeEach(() => {
	toastSuccess.mockReset();
	toastError.mockReset();
});

afterEach(async () => {
	await remoteContext.cleanup();
});

describe('When the manager loads task-assignment card options', () => {
	test('Then task and employee handlers return seeded categories and regular employees only', async () => {
		const manager = await remoteContext.seedUser({
			roleType: 'manager',
			namePrefix: managerTaskAssignmentIntegrationNames.load.managerNamePrefix,
			emailPrefix: managerTaskAssignmentIntegrationNames.load.managerEmailPrefix,
		});
		const employeeOne = await remoteContext.seedUser({
			roleType: 'regular',
			namePrefix: managerTaskAssignmentIntegrationNames.load.employeeOneNamePrefix,
			emailPrefix: managerTaskAssignmentIntegrationNames.load.employeeOneEmailPrefix,
			employeeIdPrefix: managerTaskAssignmentIntegrationNames.load.employeeIdPrefix,
			points: 0,
			xp: 0,
			totalPointsEarned: 0,
		});
		const employeeTwo = await remoteContext.seedUser({
			roleType: 'regular',
			namePrefix: managerTaskAssignmentIntegrationNames.load.employeeTwoNamePrefix,
			emailPrefix: managerTaskAssignmentIntegrationNames.load.employeeTwoEmailPrefix,
			employeeIdPrefix: managerTaskAssignmentIntegrationNames.load.employeeIdPrefix,
			points: 0,
			xp: 0,
			totalPointsEarned: 0,
		});
		const hr = await remoteContext.seedUser({
			roleType: 'hr',
			namePrefix: managerTaskAssignmentIntegrationNames.load.hrNamePrefix,
			emailPrefix: managerTaskAssignmentIntegrationNames.load.hrEmailPrefix,
		});
		const categoryOne = await remoteContext.seedCategory({
			namePrefix: managerTaskAssignmentIntegrationNames.load.categoryOneNamePrefix,
			points: 9,
			xp: 2,
			isRepeatable: true,
			type: 'kitchen-daily',
		});
		const categoryTwo = await remoteContext.seedCategory({
			namePrefix: managerTaskAssignmentIntegrationNames.load.categoryTwoNamePrefix,
			points: 15,
			xp: 5,
			isRepeatable: false,
			type: 'kitchen-weekly',
		});

		currentServerClient = remoteContext.createServerClientForUser(manager);

		const tasks = await handleFetchTaskList();
		const employees = await handleFetchEmployeeList();

		const loadedTaskOne = tasks.find((task) => task.id === categoryOne.id);
		const loadedTaskTwo = tasks.find((task) => task.id === categoryTwo.id);
		const loadedEmployeeOne = employees.find((employee) => employee.id === employeeOne.id);
		const loadedEmployeeTwo = employees.find((employee) => employee.id === employeeTwo.id);

		expect(loadedTaskOne).toMatchObject({
			id: categoryOne.id,
			name: categoryOne.name,
			points: categoryOne.points,
			xp: categoryOne.xp,
			isRepeatable: categoryOne.is_repeatable,
		});
		expect(loadedTaskTwo).toMatchObject({
			id: categoryTwo.id,
			name: categoryTwo.name,
			points: categoryTwo.points,
			xp: categoryTwo.xp,
			isRepeatable: categoryTwo.is_repeatable,
		});
		expect(loadedEmployeeOne?.id).toBe(employeeOne.id);
		expect(loadedEmployeeOne?.name).toBe(employeeOne.name);
		expect(loadedEmployeeOne?.empId).toBe(employeeOne.employeeId || '');
		expect(loadedEmployeeTwo?.id).toBe(employeeTwo.id);
		expect(employees.some((employee) => employee.id === hr.id)).toBe(false);
		expect(toastError).not.toHaveBeenCalled();
	});
});

describe('When the manager assigns tasks from the task-assignment card', () => {
	test('Then the assignment handler creates remote task rows and task notifications for each selected employee', async () => {
		const manager = await remoteContext.seedUser({
			roleType: 'manager',
			namePrefix: managerTaskAssignmentIntegrationNames.assign.managerNamePrefix,
			emailPrefix: managerTaskAssignmentIntegrationNames.assign.managerEmailPrefix,
		});
		const employeeOne = await remoteContext.seedUser({
			roleType: 'regular',
			namePrefix: managerTaskAssignmentIntegrationNames.assign.employeeOneNamePrefix,
			emailPrefix: managerTaskAssignmentIntegrationNames.assign.employeeOneEmailPrefix,
			employeeIdPrefix: managerTaskAssignmentIntegrationNames.assign.employeeIdPrefix,
			points: 0,
			xp: 0,
			totalPointsEarned: 0,
		});
		const employeeTwo = await remoteContext.seedUser({
			roleType: 'regular',
			namePrefix: managerTaskAssignmentIntegrationNames.assign.employeeTwoNamePrefix,
			emailPrefix: managerTaskAssignmentIntegrationNames.assign.employeeTwoEmailPrefix,
			employeeIdPrefix: managerTaskAssignmentIntegrationNames.assign.employeeIdPrefix,
			points: 0,
			xp: 0,
			totalPointsEarned: 0,
		});
		const category = await remoteContext.seedCategory({
			namePrefix: managerTaskAssignmentIntegrationNames.assign.categoryNamePrefix,
			points: 25,
			xp: 8,
			isRepeatable: true,
			type: 'kitchen-assignment',
		});

		currentServerClient = remoteContext.createServerClientForUser(manager);

		const startDate = new Date('2026-04-12T00:00:00.000Z').toISOString();
		const endDate = '2099-12-31';
		const assignedTasks = await handleAddTaskAssignment(
			category.id,
			[employeeOne.id, employeeTwo.id],
			startDate,
			endDate,
			5
		);

		const assignedTask = assignedTasks[0];
		const assignedEmployeeIds = assignedTask?.assignedEmployees.map((employee) => employee.id) || [];

		expect(assignedTasks).toHaveLength(1);
		expect(assignedTask?.taskId).toBe(category.id);
		expect(assignedTask?.maxOrders).toBe(5);
		expect(assignedTask?.status).toBe('assigned');
		expect(assignedEmployeeIds).toEqual(expect.arrayContaining([employeeOne.id, employeeTwo.id]));

		const { data: insertedTasks, error: insertedTasksError } = await remoteContext.admin
			.from('KPITask')
			.select('id, assigned_to, status, max_orders, deadline_date, category_id')
			.eq('category_id', category.id)
			.in('assigned_to', [employeeOne.id, employeeTwo.id]);

		expect(insertedTasksError).toBeNull();
		expect(insertedTasks).toHaveLength(2);

		insertedTasks?.forEach((row) => {
			remoteContext.trackTaskId(row.id);
		});

		insertedTasks?.forEach((row) => {
			expect(row.status).toBe('assigned');
			expect(row.max_orders).toBe(5);
			expect(row.deadline_date).toContain(endDate);
			expect(row.category_id).toBe(category.id);
		});

		const { data: notifications, error: notificationError } = await remoteContext.admin
			.from('Notification')
			.select('id, user_id, type, message')
			.eq('type', 'task')
			.in('user_id', [employeeOne.id, employeeTwo.id]);

		expect(notificationError).toBeNull();
		expect(notifications).toHaveLength(2);

		notifications?.forEach((row) => {
			remoteContext.trackNotificationId(row.id);
			expect(row.type).toBe('task');
			expect(row.message).toContain('assigned to a task');
		});

		expect(toastSuccess).toHaveBeenCalledWith('Task assigned successfully');
		expect(toastError).not.toHaveBeenCalled();
	});
});

describe('When selected employees include both busy and available users', () => {
	test('Then the assignment handler assigns only available users and skips busy users on the same category', async () => {
		const manager = await remoteContext.seedUser({
			roleType: 'manager',
			namePrefix: managerTaskAssignmentIntegrationNames.partial.managerNamePrefix,
			emailPrefix: managerTaskAssignmentIntegrationNames.partial.managerEmailPrefix,
		});
		const busyEmployee = await remoteContext.seedUser({
			roleType: 'regular',
			namePrefix: managerTaskAssignmentIntegrationNames.partial.busyEmployeeNamePrefix,
			emailPrefix: managerTaskAssignmentIntegrationNames.partial.busyEmployeeEmailPrefix,
			employeeIdPrefix: managerTaskAssignmentIntegrationNames.partial.employeeIdPrefix,
			points: 0,
			xp: 0,
			totalPointsEarned: 0,
		});
		const freeEmployee = await remoteContext.seedUser({
			roleType: 'regular',
			namePrefix: managerTaskAssignmentIntegrationNames.partial.freeEmployeeNamePrefix,
			emailPrefix: managerTaskAssignmentIntegrationNames.partial.freeEmployeeEmailPrefix,
			employeeIdPrefix: managerTaskAssignmentIntegrationNames.partial.employeeIdPrefix,
			points: 0,
			xp: 0,
			totalPointsEarned: 0,
		});
		const category = await remoteContext.seedCategory({
			namePrefix: managerTaskAssignmentIntegrationNames.partial.categoryNamePrefix,
			points: 18,
			xp: 6,
			isRepeatable: true,
			type: 'kitchen-partial',
		});

		await remoteContext.seedTask({
			assignedBy: manager.id,
			assignedTo: busyEmployee.id,
			categoryId: category.id,
			status: 'assigned',
			pendingOrders: 0,
			completedOrders: 0,
			maxOrders: 3,
			deadlineDate: '2099-12-31',
		});

		currentServerClient = remoteContext.createServerClientForUser(manager);

		const startDate = new Date('2026-04-12T00:00:00.000Z').toISOString();
		const endDate = '2099-12-31';
		const assignedTasks = await handleAddTaskAssignment(
			category.id,
			[busyEmployee.id, freeEmployee.id],
			startDate,
			endDate,
			3
		);

		expect(assignedTasks).toHaveLength(1);
		expect(assignedTasks[0].assignedEmployees).toHaveLength(1);
		expect(assignedTasks[0].assignedEmployees[0].id).toBe(freeEmployee.id);

		const { data: freeEmployeeRows, error: freeEmployeeRowsError } = await remoteContext.admin
			.from('KPITask')
			.select('id, assigned_to, category_id, status')
			.eq('category_id', category.id)
			.eq('assigned_to', freeEmployee.id);

		expect(freeEmployeeRowsError).toBeNull();
		expect(freeEmployeeRows).toHaveLength(1);

		freeEmployeeRows?.forEach((row) => {
			remoteContext.trackTaskId(row.id);
			expect(row.assigned_to).toBe(freeEmployee.id);
			expect(row.category_id).toBe(category.id);
			expect(row.status).toBe('assigned');
		});

		const { data: notifications, error: notificationError } = await remoteContext.admin
			.from('Notification')
			.select('id, user_id, type')
			.eq('type', 'task')
			.in('user_id', [busyEmployee.id, freeEmployee.id]);

		expect(notificationError).toBeNull();
		expect(notifications?.some((row) => row.user_id === freeEmployee.id)).toBe(true);
		expect(notifications?.some((row) => row.user_id === busyEmployee.id)).toBe(false);

		notifications?.forEach((row) => remoteContext.trackNotificationId(row.id));

		expect(toastSuccess).toHaveBeenCalledWith('Task assigned successfully');
		expect(toastError).not.toHaveBeenCalled();
	});
});

describe('When all selected employees are already busy on the same task category', () => {
	test('Then the assignment handler returns no assignments, shows an error toast, and creates no new task rows', async () => {
		const manager = await remoteContext.seedUser({
			roleType: 'manager',
			namePrefix: managerTaskAssignmentIntegrationNames.allBusy.managerNamePrefix,
			emailPrefix: managerTaskAssignmentIntegrationNames.allBusy.managerEmailPrefix,
		});
		const employeeOne = await remoteContext.seedUser({
			roleType: 'regular',
			namePrefix: managerTaskAssignmentIntegrationNames.allBusy.employeeOneNamePrefix,
			emailPrefix: managerTaskAssignmentIntegrationNames.allBusy.employeeOneEmailPrefix,
			employeeIdPrefix: managerTaskAssignmentIntegrationNames.allBusy.employeeIdPrefix,
			points: 0,
			xp: 0,
			totalPointsEarned: 0,
		});
		const employeeTwo = await remoteContext.seedUser({
			roleType: 'regular',
			namePrefix: managerTaskAssignmentIntegrationNames.allBusy.employeeTwoNamePrefix,
			emailPrefix: managerTaskAssignmentIntegrationNames.allBusy.employeeTwoEmailPrefix,
			employeeIdPrefix: managerTaskAssignmentIntegrationNames.allBusy.employeeIdPrefix,
			points: 0,
			xp: 0,
			totalPointsEarned: 0,
		});
		const category = await remoteContext.seedCategory({
			namePrefix: managerTaskAssignmentIntegrationNames.allBusy.categoryNamePrefix,
			points: 11,
			xp: 3,
			isRepeatable: true,
			type: 'kitchen-all-busy',
		});

		await remoteContext.seedTask({
			assignedBy: manager.id,
			assignedTo: employeeOne.id,
			categoryId: category.id,
			status: 'assigned',
			pendingOrders: 1,
			completedOrders: 0,
			maxOrders: 2,
			deadlineDate: '2099-12-31',
		});
		await remoteContext.seedTask({
			assignedBy: manager.id,
			assignedTo: employeeTwo.id,
			categoryId: category.id,
			status: 'in review',
			pendingOrders: 1,
			completedOrders: 0,
			maxOrders: 2,
			deadlineDate: '2099-12-31',
		});

		currentServerClient = remoteContext.createServerClientForUser(manager);

		const startDate = new Date('2026-04-12T00:00:00.000Z').toISOString();
		const endDate = '2099-12-31';
		const assignedTasks = await handleAddTaskAssignment(
			category.id,
			[employeeOne.id, employeeTwo.id],
			startDate,
			endDate,
			2
		);

		expect(assignedTasks).toEqual([]);
		expect(toastError).toHaveBeenCalledWith(
			expect.stringContaining('All selected employees are already assigned')
		);

		const { data: allRows, error: allRowsError } = await remoteContext.admin
			.from('KPITask')
			.select('id, assigned_to')
			.eq('category_id', category.id)
			.in('assigned_to', [employeeOne.id, employeeTwo.id]);

		expect(allRowsError).toBeNull();
		expect(allRows).toHaveLength(2);

		const { data: notifications, error: notificationError } = await remoteContext.admin
			.from('Notification')
			.select('id')
			.eq('type', 'task')
			.in('user_id', [employeeOne.id, employeeTwo.id]);

		expect(notificationError).toBeNull();
		expect(notifications).toHaveLength(0);
		expect(toastSuccess).not.toHaveBeenCalled();
	});
});
