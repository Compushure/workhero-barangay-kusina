import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AttendanceConfig } from '@/types';
import { attendanceKeys } from '../queries/attendanceQueries';
import { handleTimeInAttendance, handleTimeOutAttendance } from '@/action-handlers/attendance';

export function useTimeInAttendance(config?: Partial<AttendanceConfig>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await handleTimeInAttendance(config);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

export function useTimeOutAttendance(config?: Partial<AttendanceConfig>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logId?: string) => {
      const result = await handleTimeOutAttendance(logId, config);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}
