/**
 *  WARNING: MAKE SURE YOU HAVE THE RIGHT ENV FOR THE TEST DB DIOS MIOKO
 * Test coverage:
 * - Load remote task-editor categories and metadata
 * - Create, edit, and delete a remote task category
 * - Reject duplicate task category names and invalid numeric bounds
 * - Guard category delete when linked KPI tasks exist
 * Run this file only: npm test -- --runTestsByPath __tests___/integration/manager/task-editor.integration.test.ts
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
	handleAddTaskCategory,
	handleDeleteTaskCategoryAction,
	handleEditTaskCategoryAction,
	handleFetchTaskCategoriesPaginated,
	handleFetchTaskCategoryMetadata,
} from '@/action-handlers/manager/editor';
import { RemoteSupabaseTestContext } from '../../utils/remoteSupabaseTestUtils';
import {
	addTaskCategoryInputMockData,
	editTaskCategoryInputMockData,
	managerTaskEditorIntegrationNames,
} from '../../mockData/managerTaskEditorMockData';

type ServerClient = ReturnType<RemoteSupabaseTestContext['createServerClientForUser']>;
let currentServerClient: ServerClient;

const toastSuccess = jest.fn();
const toastError = jest.fn();
const remoteContext = new RemoteSupabaseTestContext('manager-task-editor');

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

describe('When the manager loads task-editor remote data', () => {
	test('Then paginated categories and metadata include seeded rows with repeatability filters applied', async () => {
		const manager = await remoteContext.seedUser({
			roleType: 'manager',
			namePrefix: managerTaskEditorIntegrationNames.load.managerNamePrefix,
			emailPrefix: managerTaskEditorIntegrationNames.load.managerEmailPrefix,
		});
		const repeatableCategory = await remoteContext.seedCategory({
			namePrefix: managerTaskEditorIntegrationNames.load.repeatableCategoryNamePrefix,
			points: 15,
			xp: 4,
			isRepeatable: true,
			type: 'task-editor-load-a',
		});
		const nonRepeatableCategory = await remoteContext.seedCategory({
			namePrefix: managerTaskEditorIntegrationNames.load.nonRepeatableCategoryNamePrefix,
			points: 18,
			xp: 7,
			isRepeatable: false,
			type: 'task-editor-load-b',
		});

		currentServerClient = remoteContext.createServerClientForUser(manager);

		const repeatablePage = await handleFetchTaskCategoriesPaginated(
			1,
			10,
			'name-asc',
			managerTaskEditorIntegrationNames.load.searchTarget,
			'repeatable'
		);
		const nonRepeatablePage = await handleFetchTaskCategoriesPaginated(
			1,
			10,
			'name-asc',
			managerTaskEditorIntegrationNames.load.nonRepeatableSearchTarget,
			'non-repeatable'
		);
		const metadata = await handleFetchTaskCategoryMetadata();

		expect(repeatablePage.tasks.some((task) => task.id === repeatableCategory.id)).toBe(true);
		expect(repeatablePage.tasks.every((task) => task.isRepeatable)).toBe(true);
		expect(repeatablePage.count).toBeGreaterThanOrEqual(1);
		expect(repeatablePage.totalPages).toBeGreaterThanOrEqual(1);

		expect(nonRepeatablePage.tasks.some((task) => task.id === nonRepeatableCategory.id)).toBe(true);
		expect(nonRepeatablePage.tasks.every((task) => !task.isRepeatable)).toBe(true);

		expect(metadata.names).toContain(repeatableCategory.name);
		expect(metadata.names).toContain(nonRepeatableCategory.name);
		expect(metadata.types).toContain('task-editor-load-a');
		expect(metadata.types).toContain('task-editor-load-b');
		expect(toastError).not.toHaveBeenCalled();
	});
});

describe('When the manager manages a task category lifecycle', () => {
	test('Then task-editor handlers add, edit, and delete the category in the remote database', async () => {
		const manager = await remoteContext.seedUser({
			roleType: 'manager',
			namePrefix: managerTaskEditorIntegrationNames.lifecycle.managerNamePrefix,
			emailPrefix: managerTaskEditorIntegrationNames.lifecycle.managerEmailPrefix,
		});

		currentServerClient = remoteContext.createServerClientForUser(manager);

		const createdCategory = await handleAddTaskCategory({
			...addTaskCategoryInputMockData,
			name: `${managerTaskEditorIntegrationNames.lifecycle.createNamePrefix} ${Date.now()}`,
		});

		expect(createdCategory?.id).toBeTruthy();
		remoteContext.trackCategoryId(createdCategory!.id);

		const { data: createdRow, error: createdRowError } = await remoteContext.admin
			.from('KPICategory')
			.select('id, name, type, description, points, xp, is_repeatable')
			.eq('id', createdCategory!.id)
			.single();

		expect(createdRowError).toBeNull();
		expect(createdRow?.name).toBe(createdCategory!.name);
		expect(createdRow?.type).toBe(addTaskCategoryInputMockData.type);
		expect(createdRow?.points).toBe(addTaskCategoryInputMockData.points);
		expect(createdRow?.xp).toBe(addTaskCategoryInputMockData.xp);
		expect(createdRow?.is_repeatable).toBe(addTaskCategoryInputMockData.isRepeatable);

		const editedCategory = await handleEditTaskCategoryAction(createdCategory!.id, {
			...editTaskCategoryInputMockData,
			name: `${managerTaskEditorIntegrationNames.lifecycle.editNamePrefix} ${Date.now()}`,
		});

		expect(editedCategory?.id).toBe(createdCategory!.id);

		const { data: editedRow, error: editedRowError } = await remoteContext.admin
			.from('KPICategory')
			.select('id, name, type, description, points, xp, is_repeatable')
			.eq('id', createdCategory!.id)
			.single();

		expect(editedRowError).toBeNull();
		expect(editedRow?.name).toBe(editedCategory?.name);
		expect(editedRow?.type).toBe(editTaskCategoryInputMockData.type);
		expect(editedRow?.description).toBe(editTaskCategoryInputMockData.description);
		expect(editedRow?.points).toBe(editTaskCategoryInputMockData.points);
		expect(editedRow?.xp).toBe(editTaskCategoryInputMockData.xp);
		expect(editedRow?.is_repeatable).toBe(editTaskCategoryInputMockData.isRepeatable);

		const deleted = await handleDeleteTaskCategoryAction(createdCategory!.id);
		const { data: deletedRow, error: deletedRowError } = await remoteContext.admin
			.from('KPICategory')
			.select('id')
			.eq('id', createdCategory!.id)
			.maybeSingle();

		expect(deleted).toBe(true);
		expect(deletedRowError).toBeNull();
		expect(deletedRow).toBeNull();
		expect(toastSuccess).toHaveBeenCalledWith('task category added successfully to List');
		expect(toastSuccess).toHaveBeenCalledWith('task category updated successfully');
		expect(toastSuccess).toHaveBeenCalledWith('task category deleted successfully');
		expect(toastError).not.toHaveBeenCalled();
	});
});

describe('When the manager attempts guarded task-category writes', () => {
	test('Then duplicate task category names are rejected without adding another row', async () => {
		const manager = await remoteContext.seedUser({
			roleType: 'manager',
			namePrefix: managerTaskEditorIntegrationNames.guards.managerNamePrefix,
			emailPrefix: managerTaskEditorIntegrationNames.guards.managerEmailPrefix,
		});
		const existingCategory = await remoteContext.seedCategory({
			namePrefix: managerTaskEditorIntegrationNames.guards.duplicateCategoryNamePrefix,
			points: 20,
			xp: 5,
			isRepeatable: true,
			type: 'task-editor-guard-duplicate',
		});

		currentServerClient = remoteContext.createServerClientForUser(manager);

		const duplicateAttempt = await handleAddTaskCategory({
			...addTaskCategoryInputMockData,
			name: existingCategory.name,
			type: 'task-editor-guard-duplicate',
		});
		const { count: duplicateNameCount, error: duplicateCountError } = await remoteContext.admin
			.from('KPICategory')
			.select('*', { count: 'exact', head: true })
			.eq('name', existingCategory.name);

		expect(duplicateAttempt).toBeNull();
		expect(duplicateCountError).toBeNull();
		expect(duplicateNameCount).toBe(1);
		expect(toastError).toHaveBeenCalledWith(
			expect.stringContaining('Task category with this name already exists')
		);
		expect(toastSuccess).not.toHaveBeenCalled();
	});

	test('Then numeric bound checks reject categories with points or XP above configured limits', async () => {
		const manager = await remoteContext.seedUser({
			roleType: 'manager',
			namePrefix: managerTaskEditorIntegrationNames.guards.managerNamePrefix,
			emailPrefix: managerTaskEditorIntegrationNames.guards.managerEmailPrefix,
		});

		currentServerClient = remoteContext.createServerClientForUser(manager);

		const tooHighPointsName =
			`${managerTaskEditorIntegrationNames.guards.highPointsNamePrefix} ${Date.now()}`;
		const tooHighXpName = `${managerTaskEditorIntegrationNames.guards.highXpNamePrefix} ${Date.now()}`;

		const tooHighPointsAttempt = await handleAddTaskCategory({
			...addTaskCategoryInputMockData,
			name: tooHighPointsName,
			points: 10001,
			xp: 50,
		});
		const tooHighXpAttempt = await handleAddTaskCategory({
			...addTaskCategoryInputMockData,
			name: tooHighXpName,
			points: 100,
			xp: 5001,
		});

		const { count: highPointsCount, error: highPointsCountError } = await remoteContext.admin
			.from('KPICategory')
			.select('*', { count: 'exact', head: true })
			.eq('name', tooHighPointsName);
		const { count: highXpCount, error: highXpCountError } = await remoteContext.admin
			.from('KPICategory')
			.select('*', { count: 'exact', head: true })
			.eq('name', tooHighXpName);

		expect(tooHighPointsAttempt).toBeNull();
		expect(tooHighXpAttempt).toBeNull();
		expect(highPointsCountError).toBeNull();
		expect(highXpCountError).toBeNull();
		expect(highPointsCount).toBe(0);
		expect(highXpCount).toBe(0);
		expect(toastError).toHaveBeenCalledWith(expect.stringContaining('Points cannot exceed 10,000'));
		expect(toastError).toHaveBeenCalledWith(expect.stringContaining('XP cannot exceed 5,000'));
		expect(toastSuccess).not.toHaveBeenCalled();
	});
});

describe('When a task category is linked to existing KPI task rows', () => {
	test('Then deleting the category is blocked by FK constraints and linked rows remain intact', async () => {
		const manager = await remoteContext.seedUser({
			roleType: 'manager',
			namePrefix: managerTaskEditorIntegrationNames.guards.managerNamePrefix,
			emailPrefix: managerTaskEditorIntegrationNames.guards.managerEmailPrefix,
		});
		const employee = await remoteContext.seedUser({
			roleType: 'regular',
			namePrefix: managerTaskEditorIntegrationNames.guards.deleteGuardEmployeeNamePrefix,
			emailPrefix: managerTaskEditorIntegrationNames.guards.deleteGuardEmployeeEmailPrefix,
			employeeIdPrefix: managerTaskEditorIntegrationNames.guards.deleteGuardEmployeeIdPrefix,
			points: 0,
			xp: 0,
			totalPointsEarned: 0,
		});
		const linkedCategory = await remoteContext.seedCategory({
			namePrefix: managerTaskEditorIntegrationNames.guards.deleteGuardCategoryNamePrefix,
			points: 16,
			xp: 6,
			isRepeatable: true,
			type: 'task-editor-guard-delete',
		});
		const linkedTask = await remoteContext.seedTask({
			assignedBy: manager.id,
			assignedTo: employee.id,
			categoryId: linkedCategory.id,
			status: 'assigned',
			pendingOrders: 1,
			completedOrders: 0,
			maxOrders: 2,
			deadlineDate: '2099-12-31',
		});

		currentServerClient = remoteContext.createServerClientForUser(manager);

		const deleted = await handleDeleteTaskCategoryAction(linkedCategory.id);
		const { data: categoryAfterDelete, error: categoryReloadError } = await remoteContext.admin
			.from('KPICategory')
			.select('id')
			.eq('id', linkedCategory.id)
			.maybeSingle();
		const { data: taskAfterDelete, error: taskReloadError } = await remoteContext.admin
			.from('KPITask')
			.select('id, category_id')
			.eq('id', linkedTask.id)
			.single();

		expect(deleted).toBe(false);
		expect(categoryReloadError).toBeNull();
		expect(taskReloadError).toBeNull();
		expect(categoryAfterDelete?.id).toBe(linkedCategory.id);
		expect(taskAfterDelete?.category_id).toBe(linkedCategory.id);
		expect(toastError).toHaveBeenCalledWith(expect.stringContaining('Failed to delete task category'));
		expect(toastError).toHaveBeenCalledWith(expect.stringContaining('KPITask_category_id_fkey'));
		expect(toastSuccess).not.toHaveBeenCalled();
	});
});
