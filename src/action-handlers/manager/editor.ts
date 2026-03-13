import {
  addTaskCategory,
  deleteTaskCategory,
  editTaskCategory,
  fetchTaskCategoriesPaginated,
  fetchTaskCategoryMetadata,
} from "@/actions/manager/editor";
import { safeAction } from "@/lib/utils/safe-action";
import { TaskCategory } from "@/types/manager/task-editor";
import { AddTaskInput, EditTaskInput } from "@/zod/schemas/task";
import { toast } from "sonner";
import type { ServerActionResponse } from "@/types";

export async function handleFetchTaskCategoriesPaginated(
  page: number = 1,
  pageSize: number = 10,
  sortBy: string = 'type-name',
  searchTerm: string = '',
  repeatabilityFilter: 'all' | 'repeatable' | 'non-repeatable' = 'all'
): Promise<{ tasks: TaskCategory[]; count: number; totalPages: number }> {
  const result = await safeAction<
    ServerActionResponse<{
      data: TaskCategory[];
      count: number;
      totalPages: number;
    }>
  >(() => fetchTaskCategoriesPaginated(page, pageSize, sortBy, searchTerm, repeatabilityFilter));

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return { tasks: [], count: 0, totalPages: 0 };
  }

  const payload = result.data?.data;
  return {
    tasks: payload?.data ?? [],
    count: payload?.count ?? 0,
    totalPages: payload?.totalPages ?? 0,
  };
}


// Action handler to add a new task category
export async function handleAddTaskCategory(
  input: AddTaskInput
): Promise<TaskCategory | null> {
  const result = await safeAction(() => addTaskCategory(input));
  if (!result.success || result.data?.error) {
    toast.error(`Failed to add task category: ${result.error || result.data?.error}`);
    return null;
  }

  toast.success('task category added successfully to List');
  return result.data?.data ?? null;
}

// Action handler to edit an existing reward/mercado item
export async function handleEditTaskCategoryAction(
  id: string,
  input: EditTaskInput
): Promise<TaskCategory | null> {
  const result = await safeAction(() => editTaskCategory(id, input));

  if (!result.success || result.data?.error) {
    toast.error(`Failed to update task category: ${result.error || result.data?.error}`);
    return null;
  }

  toast.success('task category updated successfully');
  return result.data?.data ?? null;
}

// Action handler to edit an existing reward/mercado item
export async function handleDeleteTaskCategoryAction(
  id: string,
): Promise<boolean> {
  const result = await safeAction(() => deleteTaskCategory(id));

  if (!result.success || result.data?.error) {
    toast.error(`Failed to delete task category: ${result.error || result.data?.error}`);
    return false;
  }

  toast.success('task category deleted successfully');
  return true;
}

export async function handleFetchTaskCategoryMetadata(): Promise<{
  names: string[];
  types: string[];
}> {
  const result = await safeAction<ServerActionResponse<{ names: string[]; types: string[] }>>(
    () => fetchTaskCategoryMetadata()
  );

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return { names: [], types: [] };
  }

  return {
    names: result.data?.data?.names ?? [],
    types: result.data?.data?.types ?? [],
  };
}