import { Suspense } from 'react';
import { protectManagerRoute } from '@/actions/auth';
import { BarChart3, Users, Target } from 'lucide-react';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-muted-foreground">Loading manager dashboard...</span>
      </div>
    </div>
  );
}

function ManagerDashboardClient() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your manager dashboard. Oversee your team and track performance metrics.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-card rounded-lg border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Team Management</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage your team members, assignments, and performance reviews.
            </p>
          </div>

          <div className="p-6 bg-card rounded-lg border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Reports & Analytics</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              View detailed reports on team productivity and performance metrics.
            </p>
          </div>

          <div className="p-6 bg-card rounded-lg border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold">Goals & Objectives</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Set and track team goals, objectives, and key performance indicators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ManagerDashboard() {
  await protectManagerRoute();
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ManagerDashboardClient />
    </Suspense>
  );
}
