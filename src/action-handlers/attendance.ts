import { safeAction } from '@/lib/utils/safe-action';
import { toast } from 'sonner';
import {
  getAttendanceConfigAction,
  getTodayAttendanceStatusAction,
  timeInAttendanceAction,
  timeOutAttendanceAction,
} from '@/actions/attendance';
import type { AttendanceConfig, AttendanceStatus } from '@/types';

export async function handleGetAttendanceConfig(): Promise<{
  error: string | null;
  data?: AttendanceConfig;
}> {
  const result = await safeAction(() => getAttendanceConfigAction());

  if (!result.success || result.data?.error) {
    toast.error('Failed to load attendance config');
    return { error: result.error || result.data?.error || 'Failed to load config' };
  }

  return { error: null, data: result.data?.data };
}

export async function handleGetTodayAttendanceStatus(
  config?: Partial<AttendanceConfig>
): Promise<{ error: string | null; data?: AttendanceStatus }> {
  const result = await safeAction(() => getTodayAttendanceStatusAction(config));

  if (!result.success || result.data?.error) {
    return { error: result.error || result.data?.error || 'Failed to load attendance status' };
  }

  return { error: null, data: result.data?.data };
}

export async function handleTimeInAttendance(
  config?: Partial<AttendanceConfig>
): Promise<{ error: string | null; data?: AttendanceStatus }> {
  const result = await safeAction(() => timeInAttendanceAction(config));

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error || 'Failed to time in');
    return { error: result.error || result.data?.error || 'Failed to time in' };
  }

  toast.success('Timed in successfully');
  return { error: null, data: result.data?.data };
}

export async function handleTimeOutAttendance(
  logId?: string,
  config?: Partial<AttendanceConfig>
): Promise<{ error: string | null; data?: AttendanceStatus }> {
  const result = await safeAction(() => timeOutAttendanceAction(logId, config));

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error || 'Failed to time out');
    return { error: result.error || result.data?.error || 'Failed to time out' };
  }

  toast.success('Timed out successfully');
  return { error: null, data: result.data?.data };
}
