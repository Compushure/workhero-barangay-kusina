/**
 * HR Dashboard Route (Server Component)
 * =====================================
 * Server component for HR dashboard.
 * Only accessible by users with 'hr' role in claims.
 */

import { Suspense } from 'react';
import { protectHRRoute } from '@/actions/auth';
import { Users, FileText, Calendar } from 'lucide-react';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-muted-foreground">Loading HR dashboard...</span>
      </div>
    </div>
  );
}

function HRDashboardClient() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">HR Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your HR dashboard. Manage employee records, benefits, and HR operations.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-card rounded-lg border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Employee Management</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage employee records, profiles, and employment information.
            </p>
          </div>

          <div className="p-6 bg-card rounded-lg border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Benefits & Payroll</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage employee benefits, compensation, and payroll information.
            </p>
          </div>

          <div className="p-6 bg-card rounded-lg border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold">Leave Management</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Handle employee leave requests, approvals, and vacation scheduling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function HRDashboard() {
  await protectHRRoute();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HRDashboardClient />
    </Suspense>
  );
}
