import { useQuery } from '@tanstack/react-query';
import { handleGetAttendanceConfig, handleGetTodayAttendanceStatus, handleGetTodayAttendanceTimeline } from '@/action-handlers/employee/attendance';
import type { AttendanceConfig, AttendanceStatus, AttendanceTimelineEntry } from '@/types';

/*
query keys — unique identifiers for each type of attendance query.
pra mag hapus ang invalidation 

all → base key for all attendance queries.

config() → key for attendance configuration.

timeline() → key for today’s attendance timeline.
today(config) → key for today’s attendance status, optionally parameterized by config.
*/
export const attendanceKeys = {
  all: ['attendance'] as const,
  config: () => [...attendanceKeys.all, 'config'] as const,
  timeline: () => [...attendanceKeys.all, 'timeline'] as const,
  today: (config?: Partial<AttendanceConfig>) =>
    [...attendanceKeys.all, 'today', config ?? {}] as const,
};

export function useGetAttendanceConfig() {
  return useQuery<AttendanceConfig, Error>({
    // query key unique identifier for htis set 
    queryKey: attendanceKeys.config(),
    queryFn: async () => {
      const result = await handleGetAttendanceConfig();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data as AttendanceConfig;
    },
    // stale time date considtion 

    staleTime: 10 * 60 * 1000,
    // cache garbage collectied
    gcTime: 30 * 60 * 1000,
  });
}

// medyo same lng ni sila ang querykey lng gid ang big deal, maybe
// MAYBE SHOULD PROABBLY MAKE CONts FOR THE STATE TIME AND GC TIME TO PREVENT MAGIC NUMBERS??
// galing it'll be hard when gusto ta i iban ang mga valid data time frame ??
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
