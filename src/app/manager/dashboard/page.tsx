import { Suspense } from 'react';
import { protectManagerRoute } from '@/actions/shared/auth';
import { BarChart3, Users, Target } from 'lucide-react';
import { CookingPotSuspense } from '@/components/shared/cooking-pot-suspense';

function LoadingFallback() {
  return <CookingPotSuspense label="Loading manager dashboard..." />;
}

function ManagerDashboardClient() {
  return (
    <div className="min-h-screen bg-background px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto">
        <div className="mb-5 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your manager dashboard. Oversee your team and track performance metrics.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-5 lg:gap-6 xl:gap-7 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-4 sm:p-5 lg:p-6 bg-card rounded-lg border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Team Management</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage your team members, assignments, and performance reviews.
            </p>
          </div>

          <div className="p-4 sm:p-5 lg:p-6 bg-card rounded-lg border shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Reports & Analytics</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              View detailed reports on team productivity and performance metrics.
            </p>
          </div>

          <div className="p-4 sm:p-5 lg:p-6 bg-card rounded-lg border shadow-sm">
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
