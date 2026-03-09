'use client';

import { TaskAssignmentProvider } from './task-assignment-page-context';
import { TaskAssignmentCard } from './task-assignment-card/task-assignment-card';
import { CurrentAssignedTasks } from './assigned-tasks-section/current-assigned-tasks';
import { PageHeader } from '../task-verification/page-header';

export function TaskAssignmentPage() {
  // ✅ Removed parent-child loading coordination - each component manages its own loading state
  // This eliminates unnecessary re-renders that cause the "fraction of a second" delay
  return (
    <TaskAssignmentProvider>
      <main className="w-full min-h-screen bg-zinc-100 px-2 py-3 sm:px-3 sm:py-4 lg:px-6 lg:py-6">
        <div className="mx-auto w-full max-w-7xl 2xl:max-w-440 space-y-3 sm:space-y-4 lg:space-y-5">
          {/* <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Task Assignment</h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">Assign tasks to employees in Barangay Kusina.</p>
          </div> */}
          <PageHeader
            title="Task Assignment"
            subtitle="Assign tasks to employees in Barangay Kusina."
          />

          <TaskAssignmentCard />
          <CurrentAssignedTasks />
        </div>
      </main>
    </TaskAssignmentProvider>
  );
}
