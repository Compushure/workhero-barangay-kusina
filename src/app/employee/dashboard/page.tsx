import { Suspense } from 'react';
import { protectEmployeeRoute } from '@/actions/shared/auth';
import EmployeeDashboardClient from '@/components/employee/dashboard/employee-dashboard';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-muted-foreground">Loading employee dashboard...</span>
      </div>
    </div>
  );
}

export default async function EmployeeDashboard() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmployeeDashboardContent />
    </Suspense>
  );
}
