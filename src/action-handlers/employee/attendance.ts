import { safeAction } from '@/lib/utils/safe-action';
import { toast } from 'sonner';
import {
  getAttendanceConfigAction,
  getTodayAttendanceTimelineAction,
  getTodayAttendanceStatusAction,
  timeInAttendanceAction,
  timeOutAttendanceAction,
  startBreakAction,
  endBreakAction,
} from '@/actions/employee/attendance';
import type { AttendanceConfig, AttendanceStatus, AttendanceTimelineEntry } from '@/types';

// MOST OF THIS IS JUST VERIFICATION
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

export async function handleGetTodayAttendanceTimeline(): Promise<{
  error: string | null;
  data?: AttendanceTimelineEntry[];
}> {
  const result = await safeAction(() => getTodayAttendanceTimelineAction());

  if (!result.success || result.data?.error) {
    return { error: result.error || result.data?.error || 'Failed to load attendance logs' };
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

export async function handleStartBreak(
  config?: Partial<AttendanceConfig>
): Promise<{ error: string | null; data?: AttendanceStatus }> {
  const result = await safeAction(() => startBreakAction(config));

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error || 'Failed to start break');
    return { error: result.error || result.data?.error || 'Failed to start break' };
  }

  toast.success('Break started successfully');
  return { error: null, data: result.data?.data };
}

export async function handleEndBreak(
  logId?: string,
  config?: Partial<AttendanceConfig>
): Promise<{ error: string | null; data?: AttendanceStatus }> {
  const result = await safeAction(() => endBreakAction(logId, config));

  if (!result.success || result.data?.error) {
    toast.error(result.error || result.data?.error || 'Failed to end break');
    return { error: result.error || result.data?.error || 'Failed to end break' };
  }

  const message = result.data?.data?.isOverBreaktime
    ? 'Break ended - exceeded recommended duration'
    : 'Break ended successfully';
  
  toast.success(message);
  return { error: null, data: result.data?.data };
}
