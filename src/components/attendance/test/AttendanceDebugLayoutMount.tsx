'use client';

import { useGetTodayAttendanceStatus } from '@/hooks/tanstack';
import AttendanceTestPanel from './AttendanceTestPanel';

export default function AttendanceDebugLayoutMount() {
  const { data: status } = useGetTodayAttendanceStatus();

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return <AttendanceTestPanel status={status} />;
}
