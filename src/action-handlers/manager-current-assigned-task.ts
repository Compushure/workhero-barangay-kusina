import { safeAction } from '@/lib/utils/safe-action';
import { fetchCurrentAssignedTasks, clearAllTasks, deleteTask } from '@/actions/manager-current-assigned-task';
import { toast } from 'sonner';
import type { AssignedTask } from '@/types';

export async function handleFetchCurrentAssignedTasks(): Promise<AssignedTask[]> {
  const result = await safeAction(() => fetchCurrentAssignedTasks());
  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return [];
  }
  return result.data?.data ?? [];
}

export async function handleClearAllTasks(): Promise<boolean> {
  const result = await safeAction(() => clearAllTasks());
  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return false;
  }
  toast.success('All tasks cleared');
  return true;
}

export async function handleDeleteTask(taskId: string): Promise<boolean> {
  const result = await safeAction(() => deleteTask(taskId));
  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error);
    return false;
  }
  toast.success('Task deleted');
  return true;
}
