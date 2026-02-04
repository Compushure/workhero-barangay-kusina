import { addTaskCategory, deleteTaskCategory, editTaskCategory, fetchTaskCategories } from "@/actions/manager-editor";
import { safeAction } from "@/lib/utils/safe-action";
import { TaskCategory } from "@/types/manager/task-editor";
import { AddTaskInput, EditTaskInput } from "@/zod/schemas/task";
import { toast } from "sonner";

export async function handleFetchTaskCategories(): Promise<TaskCategory[]> {
  const result = await safeAction(() => fetchTaskCategories());

  if (!result.success) {
    toast.error('Failed to load task categories: ' + result.error);
    return [];
  }

  if (result.data?.error) {
    toast.error(result.data.error);
    return [];
  }

  return result.data?.data ?? [];
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