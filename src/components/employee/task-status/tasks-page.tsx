'use client';

import { useMemo } from 'react';
import { TaskStatusBoard } from './task-status-board';
import { useGetEmployeeTasks } from '@/hooks/tanstack/queries/employeeTasksQueries';
import ProfileAndLevel from '../attendance/profile-level';
import XPProgressAndPoints from '../attendance/xp-points';
import { RankWidget } from '../dashboard/rank-panel';
import { Card, CardContent } from '@/components/ui/card';
import { useGetAllLevelMetadata, useGetEmployeeXP } from '@/hooks/tanstack/queries/employeeQueries';

const DEFAULT_KITCHEN_BG_URL =
  'https://ewvpbwxqkomybbhmqygm.supabase.co/storage/v1/object/public/kitchen/level_1_bg.png';

export function TasksPage() {
  const { data, error, isLoading } = useGetEmployeeTasks();
  const { data: xpData } = useGetEmployeeXP();
  const { data: levelMetadata } = useGetAllLevelMetadata();

  const kitchenBackgroundUrl = useMemo(() => {
    const currentLevel = xpData?.level ?? 1;
    const levelRow = levelMetadata?.find((row) => row.level === currentLevel);
    const dbLink = levelRow?.bg_img_link?.trim();

    return dbLink && dbLink.length > 0 ? dbLink : DEFAULT_KITCHEN_BG_URL;
  }, [levelMetadata, xpData?.level]);

  const {
    currentTasks = [],
    onReviewTasks = [],
    verifiedTasks = [],
    deniedTasks = [],
  } = data ?? {};

  return (
    <div
      className="min-h-screen w-full flex flex-col bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('${kitchenBackgroundUrl}')` }}
    >
      <header className="sticky top-0 left-0 right-0 w-full px-2 sm:px-4 pt-2 z-20 pointer-events-none">
        <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-4 p-1">
          <div className="pointer-events-auto flex max-w-full items-center gap-3 sm:gap-4 flex-nowrap overflow-x-auto">
            <ProfileAndLevel />
            <XPProgressAndPoints />
          </div>

          <div className="pointer-events-auto w-full sm:w-auto flex justify-end">
            <Card className="bg-transparent shadow-none border-none w-full sm:w-auto p-0 gap-0 mr-0 sm:mr-15">
              <CardContent className="p-0">
                <RankWidget />
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      <div className="flex w-full mx-auto px-3 py-4 sm:p-4">
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
