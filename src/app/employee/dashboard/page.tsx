/**
 * Employee Dashboard Route (Server Component)
 * ===========================================
 * Server component for employee/regular user dashboard.
 * Only accessible by users with 'regular' or 'employee' role in claims.
 */

import { Suspense } from 'react';
import { protectEmployeeRoute } from '@/actions/auth';
import { Clock, FileText, User } from 'lucide-react';

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

function EmployeeDashboardClient() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Employee Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your personal employee dashboard. View your information and submit requests.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-card rounded-lg border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">My Profile</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              View and manage your personal information and profile details.
            </p>
          </div>

          <div className="p-6 bg-card rounded-lg border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Time & Attendance</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Track your work hours, attendance, and time-off requests.
            </p>
          </div>

          <div className="p-6 bg-card rounded-lg border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold">My Documents</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Access your employment documents, contracts, and certifications.
            </p>
          </div>
        </div>
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
