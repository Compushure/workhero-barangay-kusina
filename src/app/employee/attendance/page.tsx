import AttendanceDesign from '@/components/employee/attendance/attendance-designs';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CookingPot } from 'lucide-react';

export const metadata: Metadata = {
  title: 'WorkHero | Attendance',
  icons: {
    icon: '/assets/website-logo.svg',
    shortcut: '/assets/website-logo.svg',
    apple: '/assets/website-logo.svg',
  },
};

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
