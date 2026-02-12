import { TaskStatusBoard } from './task-status-board';
import { Header } from '../header';
import NavSection from '../nav-section';
import {
  currentTasks,
  onReviewTasks,
  verifiedTasks,
  deniedTasks,
} from '@/components/employee/task-status';

export function TasksPage() {
  return (
    <div className="min-h-screen p-8 flex flex-col gap-8">
      {/* Row 1: Header */}
      <Header
        title="Tasks"
        description="View your tasks by status: Current, On Review, Verified, or Denied Approval."
      />

      {/* Row 2: Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-[1600px] mx-auto">
        {/* Left column: Navigation */}
        <div className="w-full lg:w-[250px] shrink-0">
          <NavSection />
        </div>

        {/* Right column: Task board */}
        <div className="flex-1 min-w-0">
          <TaskStatusBoard
            currentTasks={currentTasks}
            onReviewTasks={onReviewTasks}
            verifiedTasks={verifiedTasks}
            deniedTasks={deniedTasks}
          />
        </div>
      </div>

      {/* Row 3: Reserved for future footer/extra content */}
      <div className="mt-auto" />
    </div>
  );
}
