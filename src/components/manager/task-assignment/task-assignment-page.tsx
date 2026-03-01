'use client';

import { TaskAssignmentProvider } from './task-assignment-page-context';
import { TaskAssignmentCard } from './task-assignment-card/task-assignment-card';
import { CurrentAssignedTasks } from './assigned-tasks-section/current-assigned-tasks';

export function TaskAssignmentPage() {
  return (
    <TaskAssignmentProvider>
      <main className="w-full min-h-screen bg-zinc-50 p-10">
        <div className="mx-auto w-full max-w-500 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[#690003]">Task Assignment</h1>
            <p className="text-md text-gray-600">Assign tasks to employees in Barangay Kusina.</p>
          </div>

          <TaskAssignmentCard />
          <CurrentAssignedTasks />
        </div>
      </main>
    </TaskAssignmentProvider>
  );
}