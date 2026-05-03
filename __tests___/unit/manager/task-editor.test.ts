/**
 * Test coverage:
 * - Fetch paginated task categories and metadata through handlers
 * - Add, edit, and delete task categories through handlers
 * - Guard fallback/error handling for task-editor handlers
 * Run this file only: npm test -- --runTestsByPath __tests___/unit/manager/task-editor.test.ts
 */

import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
	handleAddTaskCategory,
	handleDeleteTaskCategoryAction,
	handleEditTaskCategoryAction,
	handleFetchTaskCategoriesPaginated,
	handleFetchTaskCategoryMetadata,
} from '@/action-handlers/manager/editor';
import type { ServerActionResponse } from '@/types';
import type { TaskCategory } from '@/types/manager/task-editor';
import {
	addTaskCategoryInputMockData,
	editTaskCategoryInputMockData,
} from '../../mockData/managerTaskEditorMockData';

type SafeActionResult<T> =
	| { success: true; data: T; error: null }
	| { success: false; data: null; error: string };

type FetchTaskCategoriesPaginatedFn = (
	page?: number,
	pageSize?: number,
	sortBy?: string,
	searchTerm?: string,
	repeatabilityFilter?: 'all' | 'repeatable' | 'non-repeatable'
) => Promise<
	ServerActionResponse<{
		data: TaskCategory[];
		count: number;
		totalPages: number;
	}>
>;

type FetchTaskCategoryMetadataFn = () => Promise<
	ServerActionResponse<{
		names: string[];
		types: string[];
	}>
>;

type AddTaskCategoryFn = (input: typeof addTaskCategoryInputMockData) => Promise<
	ServerActionResponse<TaskCategory>
>;

type EditTaskCategoryFn = (
	id: string,
	input: Partial<typeof editTaskCategoryInputMockData>
) => Promise<ServerActionResponse<TaskCategory>>;

type DeleteTaskCategoryFn = (id: string) => Promise<ServerActionResponse<void>>;

const fetchTaskCategoriesPaginatedMock: jest.MockedFunction<FetchTaskCategoriesPaginatedFn> =
	jest.fn();
const fetchTaskCategoryMetadataMock: jest.MockedFunction<FetchTaskCategoryMetadataFn> = jest.fn();
const addTaskCategoryMock: jest.MockedFunction<AddTaskCategoryFn> = jest.fn();
const editTaskCategoryMock: jest.MockedFunction<EditTaskCategoryFn> = jest.fn();
const deleteTaskCategoryMock: jest.MockedFunction<DeleteTaskCategoryFn> = jest.fn();
const safeActionMock = jest.fn();

jest.mock('@/actions/manager/editor', () => ({
	fetchTaskCategoriesPaginated: (
		page?: number,
		pageSize?: number,
		sortBy?: string,
		searchTerm?: string,
		repeatabilityFilter?: 'all' | 'repeatable' | 'non-repeatable'
	) =>
		fetchTaskCategoriesPaginatedMock(page, pageSize, sortBy, searchTerm, repeatabilityFilter),
	fetchTaskCategoryMetadata: () => fetchTaskCategoryMetadataMock(),
	addTaskCategory: (input: typeof addTaskCategoryInputMockData) => addTaskCategoryMock(input),
	editTaskCategory: (id: string, input: Partial<typeof editTaskCategoryInputMockData>) =>
		editTaskCategoryMock(id, input),
	deleteTaskCategory: (id: string) => deleteTaskCategoryMock(id),
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

const taskCategoryMockData: TaskCategory = {
	id: 'task-category-1',
	name: 'Kitchen Checklist',
	type: 'daily',
	description: 'Daily kitchen checklist',
	isRepeatable: true,
	points: 25,
	xp: 10,
	createdAt: '2026-04-14T00:00:00.000Z',
};

beforeEach(() => {
	fetchTaskCategoriesPaginatedMock.mockReset();
	fetchTaskCategoryMetadataMock.mockReset();
	addTaskCategoryMock.mockReset();
	editTaskCategoryMock.mockReset();
	deleteTaskCategoryMock.mockReset();
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

describe('When the manager loads task-editor data through handlers', () => {
	test('Then paginated categories handler returns tasks, count, and totalPages', async () => {
		fetchTaskCategoriesPaginatedMock.mockResolvedValue({
			error: null,
			data: {
				data: [taskCategoryMockData],
				count: 1,
				totalPages: 1,
			},
		});

		const result = await handleFetchTaskCategoriesPaginated(1, 10, 'type-name', '', 'all');

		expect(result).toEqual({
			tasks: [taskCategoryMockData],
			count: 1,
			totalPages: 1,
		});
		expect(toast.error).not.toHaveBeenCalled();
	});

	test('Then metadata handler returns names and types', async () => {
		fetchTaskCategoryMetadataMock.mockResolvedValue({
			error: null,
			data: {
				names: ['Kitchen Checklist'],
				types: ['daily'],
			},
		});

		const result = await handleFetchTaskCategoryMetadata();

		expect(result).toEqual({
			names: ['Kitchen Checklist'],
			types: ['daily'],
		});
		expect(toast.error).not.toHaveBeenCalled();
	});
});

describe('When task-editor fetch handlers fail', () => {
	test('Then paginated categories handler returns fallback pagination and shows error toast', async () => {
		fetchTaskCategoriesPaginatedMock.mockResolvedValue({
			error: 'Failed to fetch task categories: denied',
			data: undefined,
		});

		const result = await handleFetchTaskCategoriesPaginated(1, 10, 'type-name', '', 'all');

		expect(result).toEqual({ tasks: [], count: 0, totalPages: 0 });
		expect(toast.error).toHaveBeenCalledWith('Failed to fetch task categories: denied');
	});

	test('Then metadata handler returns empty arrays and shows error toast', async () => {
		fetchTaskCategoryMetadataMock.mockResolvedValue({
			error: 'Failed to fetch task category metadata: denied',
			data: undefined,
		});

		const result = await handleFetchTaskCategoryMetadata();

		expect(result).toEqual({ names: [], types: [] });
		expect(toast.error).toHaveBeenCalledWith('Failed to fetch task category metadata: denied');
	});
});

describe('When the manager writes task categories through handlers', () => {
	test('Then add handler returns created category and shows success toast', async () => {
		addTaskCategoryMock.mockResolvedValue({
			error: null,
			data: taskCategoryMockData,
		});

		const result = await handleAddTaskCategory(addTaskCategoryInputMockData);

		expect(result).toEqual(taskCategoryMockData);
		expect(toast.success).toHaveBeenCalledWith('task category added successfully to List');
		expect(toast.error).not.toHaveBeenCalled();
	});

	test('Then edit handler returns updated category and shows success toast', async () => {
		const updated = {
			...taskCategoryMockData,
			...editTaskCategoryInputMockData,
			name: editTaskCategoryInputMockData.name || taskCategoryMockData.name,
			type: editTaskCategoryInputMockData.type || taskCategoryMockData.type,
			description: editTaskCategoryInputMockData.description || taskCategoryMockData.description,
			isRepeatable:
				editTaskCategoryInputMockData.isRepeatable ?? taskCategoryMockData.isRepeatable,
			points: editTaskCategoryInputMockData.points || taskCategoryMockData.points,
			xp: editTaskCategoryInputMockData.xp || taskCategoryMockData.xp,
		};

		editTaskCategoryMock.mockResolvedValue({
			error: null,
			data: updated,
		});

		const result = await handleEditTaskCategoryAction('task-category-1', editTaskCategoryInputMockData);

		expect(result).toEqual(updated);
		expect(toast.success).toHaveBeenCalledWith('task category updated successfully');
		expect(toast.error).not.toHaveBeenCalled();
	});

	test('Then delete handler returns true and shows success toast', async () => {
		deleteTaskCategoryMock.mockResolvedValue({ error: null });

		const result = await handleDeleteTaskCategoryAction('task-category-1');

		expect(result).toBe(true);
		expect(toast.success).toHaveBeenCalledWith('task category deleted successfully');
		expect(toast.error).not.toHaveBeenCalled();
	});
});

describe('When task-editor write handlers fail', () => {
	test('Then add handler returns null and shows prefixed error toast', async () => {
		addTaskCategoryMock.mockResolvedValue({
			error: 'Task category with this name already exists',
			data: undefined,
		});

		const result = await handleAddTaskCategory(addTaskCategoryInputMockData);

		expect(result).toBeNull();
		expect(toast.error).toHaveBeenCalledWith(
			'Failed to add task category: Task category with this name already exists'
		);
	});

	test('Then edit handler returns null and shows prefixed error toast', async () => {
		editTaskCategoryMock.mockResolvedValue({
			error: 'Failed to update task category: denied',
			data: undefined,
		});

		const result = await handleEditTaskCategoryAction('task-category-1', editTaskCategoryInputMockData);

		expect(result).toBeNull();
		expect(toast.error).toHaveBeenCalledWith(
			'Failed to update task category: Failed to update task category: denied'
		);
	});

	test('Then delete handler returns false and shows prefixed error toast', async () => {
		deleteTaskCategoryMock.mockResolvedValue({
			error: 'Failed to task category: denied',
		});

		const result = await handleDeleteTaskCategoryAction('task-category-1');

		expect(result).toBe(false);
		expect(toast.error).toHaveBeenCalledWith(
			'Failed to delete task category: Failed to task category: denied'
		);
	});
});
