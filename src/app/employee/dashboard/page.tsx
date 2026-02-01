import { Suspense } from 'react';
import { protectEmployeeRoute } from '@/actions/auth';
import EmployeeDashboardClient from '@/components/employee/employee-dashboard';

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
