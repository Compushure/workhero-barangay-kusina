'use client';

import { TaskStatusBoard } from './task-status-board';
import { useGetEmployeeTasks } from '@/hooks/tanstack/queries/employeeTasksQueries';
import ProfileAndLevel from '../attendance/profile-level';
import XPProgressAndPoints from '../attendance/xp-points';
import { RankWidget } from '../dashboard/rank-panel';
import { Card, CardContent } from '@/components/ui/card';

export function TasksPage() {
  const { data, error, isLoading } = useGetEmployeeTasks();

  const {
    currentTasks = [],
    onReviewTasks = [],
    verifiedTasks = [],
    deniedTasks = [],
  } = data ?? {};

  return (
    <div className="min-h-screen w-full flex flex-col bg-[radial-gradient(circle,#FFFCF5_0%,#EFC18F_40%,#D68B5C_75%,#60203D_100%)]">

      <header className="sticky top-0 left-0 right-0 w-full px-2 sm:px-4 pt-2 z-20 pointer-events-none">
        <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-4 p-1">
          <div className="pointer-events-auto flex items-center gap-3 sm:gap-4 flex-nowrap overflow-x-auto">
            <ProfileAndLevel />
            <XPProgressAndPoints />
          </div>

          <div className="pointer-events-auto w-full sm:w-auto flex justify-end">
            <Card className="bg-transparent shadow-none border-none w-full sm:w-auto p-0 gap-0 mr-15">
              <CardContent className="p-0">
                <RankWidget />
              </CardContent>
            </Card>
          </div>
        </div>
      </header>
      
      <div className="flex flex-row w-full mx-auto p-4">
        <TaskStatusBoard
          currentTasks={currentTasks}
          inReviewTasks={onReviewTasks}
          verifiedTasks={verifiedTasks}
          rejectedTasks={deniedTasks}
          isLoading={isLoading}
          error={error}
        />
      </div>

    </div>
  );
}
