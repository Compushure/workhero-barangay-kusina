// import { HeaderSection } from './header';
import { DashboardLayout } from './layout';
import { SidebarNavigation } from './sidebar-navigation';
import { RankingCard } from './ranking-card';
import { CookingContent } from './cooking-content';
import { TasksList } from './tasks-list';
import { MOCK_RANKING_INFO, MOCK_TASKS } from './constants';


/**
 * EmployeeDashboardPage - Server Component
 * Main page component that orchestrates the entire dashboard layout:
 * - Top: Header with coins, XP, profile
 * - Middle: Navigation | Cooking Animation | Ranking
 * - Bottom: Task Table
 */
export async function EmployeeDashboardPage() {
  return (
    <div className="min-h-screen space-y-6 bg-linear-to-b from-amber-100 via-orange-100 to-red-100 p-6">
      {/* Top Row: Header Stats */}
      {/* <HeaderSection /> */}

      {/* Main Dashboard Layout */}
      <DashboardLayout
        sidebar={<SidebarNavigation />}
        centerContent={<CookingContent />}
        ranking={<RankingCard ranking={MOCK_RANKING_INFO} />}
        taskTable={<TasksList tasks={MOCK_TASKS} />}
      />
    </div>
  );
}
