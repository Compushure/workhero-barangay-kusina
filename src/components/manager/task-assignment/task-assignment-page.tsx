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
      <main className="w-full min-h-screen px-2 py-3 sm:px-3 sm:py-4 lg:px-6 lg:py-6">
        <div className="mx-auto w-full max-w-7xl 2xl:max-w-440 space-y-3 sm:space-y-4 lg:space-y-5">
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
