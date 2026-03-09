import AttendanceDesign from '@/components/employee/attendance/attendance-designs';
import { Suspense } from 'react';
import { CookingPot } from 'lucide-react';

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <CookingPot className="size-10 animate-bounce" />
        <span>Loading Attendance Dashboard...</span>
      </div>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AttendanceDesign />
    </Suspense>
  );
}
