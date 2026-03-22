'use client';

import { useMemo } from 'react';
import { TaskStatusBoard } from './task-status-board';
import { useGetEmployeeTasks } from '@/hooks/tanstack/queries/employeeTasksQueries';
import HeaderHUD from '../widgets/header-hud';
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
      className="flex h-screen w-full flex-col overflow-hidden bg-cover bg-center bg-no-repeat font-jersey tracking-[0.08em]"
      style={{ backgroundImage: `url('${kitchenBackgroundUrl}')` }}
    >
      <header className="sticky top-0 left-0 right-0 z-20 w-full px-2 pt-2 pointer-events-none sm:px-4">
        <div className="pointer-events-auto flex w-full flex-col gap-2 p-1">
          <HeaderHUD className="rounded-lg" />
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full flex-1 flex-row p-2 sm:p-3 md:p-4">
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
