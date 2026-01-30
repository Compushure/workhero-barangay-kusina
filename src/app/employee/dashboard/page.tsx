// /**
//  * Employee Dashboard Route (Server Component)
//  * ===========================================
//  * Server component for employee/regular user dashboard.
//  * Only accessible by users with 'regular' or 'employee' role in claims.
//  */

// import { Suspense } from 'react';
// import { protectEmployeeRoute } from '@/actions/auth';
// import { Clock, FileText, User } from 'lucide-react';

// function LoadingFallback() {
//   return (
//     <div className="flex items-center justify-center min-h-screen bg-background">
//       <div className="flex items-center gap-3">
//         <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
//         <span className="text-muted-foreground">Loading employee dashboard...</span>
//       </div>
//     </div>
//   );
// }

// function EmployeeDashboardClient() {
//   return (
//     <div className="min-h-screen bg-background p-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold mb-2">Employee Dashboard</h1>
//           <p className="text-muted-foreground">
//             Welcome to your personal employee dashboard. View your information and submit requests.
//           </p>
//         </div>

//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           <div className="p-6 bg-card rounded-lg border shadow-sm">
//             <div className="flex items-center gap-3 mb-2">
//               <User className="w-5 h-5 text-blue-500" />
//               <h3 className="font-semibold">My Profile</h3>
//             </div>
//             <p className="text-sm text-muted-foreground">
//               View and manage your personal information and profile details.
//             </p>
//           </div>

//           <div className="p-6 bg-card rounded-lg border shadow-sm">
//             <div className="flex items-center gap-3 mb-2">
//               <Clock className="w-5 h-5 text-green-500" />
//               <h3 className="font-semibold">Time & Attendance</h3>
//             </div>
//             <p className="text-sm text-muted-foreground">
//               Track your work hours, attendance, and time-off requests.
//             </p>
//           </div>

//           <div className="p-6 bg-card rounded-lg border shadow-sm">
//             <div className="flex items-center gap-3 mb-2">
//               <FileText className="w-5 h-5 text-orange-500" />
//               <h3 className="font-semibold">My Documents</h3>
//             </div>
//             <p className="text-sm text-muted-foreground">
//               Access your employment documents, contracts, and certifications.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default async function EmployeeDashboard() {
//   await protectEmployeeRoute();
//   return (
//     <Suspense fallback={<LoadingFallback />}>
//       <EmployeeDashboardClient />
//     </Suspense>
//   );
// }


import { Suspense } from 'react';
import { HeaderSection } from '@/src/components/employee/header';
import { CookingContent } from '@/src/components/employee/cooking-content';
import { RankingCard } from '@/src/components/employee/ranking-card';
import { TasksList } from '@/src/components/employee/tasks-list';
import { MOCK_RANKING_INFO, MOCK_TASKS } from '@/src/components/employee/constants';

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

function EmployeeDashboardContent() {
  return (
    <div className="space-y-4 bg-gradient-to-b from-amber-100 via-orange-100 to-red-100 p-6">
      {/* Top Row: Header Stats */}
      <HeaderSection />

      {/* Middle Section: 3-Column Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Center Column: Cooking Content (1/2 width) */}
        <div className="lg:col-span-6">
          <CookingContent />
        </div>

        {/* Right Column: Ranking (1/4 width) */}
        <div className="flex flex-col lg:col-span-3">
          <RankingCard ranking={MOCK_RANKING_INFO} />
        </div>
      </div>

      {/* Bottom Section: Task Table */}
      <div className="mx-auto w-full rounded-2xl bg-white p-4 shadow-lg lg:w-3/5">
        <TasksList tasks={MOCK_TASKS} />
      </div>
    </div>
  );
}

/**
 * Employee Dashboard Route (Server Component)
 * Displays employee tasks, ranking, cooking progress, and stats
 */
export default async function EmployeeDashboard() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmployeeDashboardContent />
    </Suspense>
  );
}
