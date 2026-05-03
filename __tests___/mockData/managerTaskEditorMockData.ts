import type { AddTaskInput, EditTaskInput } from '@/zod/schemas/task';

export const addTaskCategoryInputMockData: AddTaskInput = {
	name: 'Task Editor Integration Category',
	type: 'kitchen-daily',
	description: 'Integration task category created from manager task editor tests',
	points: 30,
	xp: 12,
	isRepeatable: true,
};

export const editTaskCategoryInputMockData: EditTaskInput = {
	name: 'Task Editor Integration Category Updated',
	type: 'kitchen-weekly',
	description: 'Integration task category updated from manager task editor tests',
	points: 45,
	xp: 20,
	isRepeatable: false,
};

export const managerTaskEditorIntegrationNames = {
	load: {
		managerNamePrefix: 'Task Editor Load Manager',
		managerEmailPrefix: 'task.editor.load.manager',
		repeatableCategoryNamePrefix: 'Task Editor Load Repeatable Target',
		nonRepeatableCategoryNamePrefix: 'Task Editor Load NonRepeatable Target',
		searchTarget: 'Task Editor Load Repeatable Target',
		nonRepeatableSearchTarget: 'Task Editor Load NonRepeatable Target',
	},
	lifecycle: {
		managerNamePrefix: 'Task Editor Lifecycle Manager',
		managerEmailPrefix: 'task.editor.lifecycle.manager',
		createNamePrefix: 'Task Editor Lifecycle Create',
		editNamePrefix: 'Task Editor Lifecycle Edit',
	},
	guards: {
		managerNamePrefix: 'Task Editor Guard Manager',
		managerEmailPrefix: 'task.editor.guard.manager',
		duplicateCategoryNamePrefix: 'Task Editor Guard Duplicate',
		highPointsNamePrefix: 'Task Editor Guard High Points',
		highXpNamePrefix: 'Task Editor Guard High XP',
		deleteGuardCategoryNamePrefix: 'Task Editor Guard Delete Category',
		deleteGuardEmployeeNamePrefix: 'Task Editor Guard Employee',
		deleteGuardEmployeeEmailPrefix: 'task.editor.guard.employee',
		deleteGuardEmployeeIdPrefix: 'TASK-EDITOR-GUARD-EMP',
	},
};
