import { Suspense } from 'react';
import EmployeeDashboardClient from '@/components/employee/dashboard/employee-dashboard';
import { CookingPot } from 'lucide-react';

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <CookingPot className="size-10 animate-bounce" />
        <span>Loading employee dashboard...</span>
      </div>
    </div>
  );
}

export default async function EmployeeDashboard() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmployeeDashboardClient />
    </Suspense>
  );
}
