import { useQuery } from '@tanstack/react-query';
import { handleGetAttendanceConfig, handleGetTodayAttendanceStatus, handleGetTodayAttendanceTimeline } from '@/action-handlers/employee/attendance';
import type { AttendanceConfig, AttendanceStatus, AttendanceTimelineEntry } from '@/types';

export const attendanceKeys = {
  all: ['attendance'] as const,
  config: () => [...attendanceKeys.all, 'config'] as const,
  timeline: () => [...attendanceKeys.all, 'timeline'] as const,
  today: (config?: Partial<AttendanceConfig>) =>
    [...attendanceKeys.all, 'today', config ?? {}] as const,
};

export function useGetAttendanceConfig() {
  return useQuery<AttendanceConfig, Error>({
    queryKey: attendanceKeys.config(),
    queryFn: async () => {
      const result = await handleGetAttendanceConfig();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data as AttendanceConfig;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useGetTodayAttendanceStatus(config?: Partial<AttendanceConfig>) {
  return useQuery<AttendanceStatus, Error>({
    queryKey: attendanceKeys.today(config),
    queryFn: async () => {
      const result = await handleGetTodayAttendanceStatus(config);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data as AttendanceStatus;
    },
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useGetTodayAttendanceTimeline() {
  return useQuery<AttendanceTimelineEntry[], Error>({
    queryKey: attendanceKeys.timeline(),
    queryFn: async () => {
      const result = await handleGetTodayAttendanceTimeline();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data ?? [];
    },
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
