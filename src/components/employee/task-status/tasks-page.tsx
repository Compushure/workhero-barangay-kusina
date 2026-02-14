'use client';

import { TaskStatusBoard } from './task-status-board';
import { Header } from '../header';
import NavSection from '../nav-section';
import { useGetEmployeeTasks } from '@/hooks/tanstack/queries/employeeTasksQueries';

export function TasksPage() {
  const { data, error, isLoading } = useGetEmployeeTasks();

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex flex-col gap-8">
        <Header
          title="Tasks"
          description="View your tasks by status: Current, On Review, Verified, or Denied Approval."
        />
        <div className="flex items-center justify-center flex-1">
          <div className="text-lg">Loading tasks...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 flex flex-col gap-8">
        <Header
          title="Tasks"
          description="View your tasks by status: Current, On Review, Verified, or Denied Approval."
        />
        <div className="flex items-center justify-center flex-1">
          <div className="text-lg text-destructive">Error: {error.message}</div>
        </div>
      </div>
    );
  }

  const {
    currentTasks = [],
    onReviewTasks = [],
    verifiedTasks = [],
    deniedTasks = [],
  } = data ?? {};

  return (
    <div className="min-h-screen p-8 flex flex-col gap-2">
      {/* Row 1: Header */}
      <Header
        title="Tasks"
        description="View your tasks by status: Current, On Review, Verified, or Denied Approval."
      />

      {/* Row 2: Two-column layout */}
      <div className="flex flex-row gap-8 w-full max-w-400 mx-auto">
        {/* Left column: Navigation */}
        <div className="w-30 z-10 shrink-0">
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
