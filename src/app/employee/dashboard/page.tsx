import { Suspense } from 'react';
<<<<<<< HEAD
import { protectEmployeeRoute } from '@/actions/auth';
import EmployeeDashboardClient from '@/components/employee/dashboard/employee-dashboard';
=======
import { protectEmployeeRoute } from '@/actions/shared/auth';
import EmployeeDashboardClient from '@/components/employee/employee-dashboard';
>>>>>>> 38c64158741778bd2e508317d1c1b2066239dfbb

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-muted-foreground">Loading employee dashboard...</span>
      </div>
    </div>
  );
}

export default async function EmployeeDashboard() {
  await protectEmployeeRoute();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmployeeDashboardClient />
    </Suspense>
  );
}
