'use client';

import { useState } from 'react';
import { TaskAssignmentProvider } from './task-assignment-page-context';
import { TaskAssignmentCard } from './task-assignment-card/task-assignment-card';
import { CurrentAssignedTasks } from './assigned-tasks-section/current-assigned-tasks';
import { Skeleton } from '@/components/ui/skeleton';

export function TaskAssignmentPage() {
  const [isCardLoading, setIsCardLoading] = useState(true);
  const [isListLoading, setIsListLoading] = useState(true);
  const isPageLoading = isCardLoading || isListLoading;

  return (
    <TaskAssignmentProvider>
      <main className="w-full min-h-screen bg-zinc-100 px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-7xl 2xl:max-w-440 space-y-5 sm:space-y-6 lg:space-y-8">
          {isPageLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-9 w-64 bg-muted" />
              <Skeleton className="h-5 w-96 bg-muted" />
            </div>
          ) : (
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Task Assignment</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">Assign tasks to employees in Barangay Kusina.</p>
            </div>
          )}

          <TaskAssignmentCard onInitialLoadChange={setIsCardLoading} />
          <CurrentAssignedTasks onInitialLoadChange={setIsListLoading} />
        </div>
      </main>
    </TaskAssignmentProvider>
  );
}