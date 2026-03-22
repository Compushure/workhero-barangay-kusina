'use client';

import { useMemo } from 'react';
import { TaskStatusBoard } from './task-status-board';
import { useGetEmployeeTasks } from '@/hooks/tanstack/queries/employeeTasksQueries';
import HeaderHUD from '../widgets/header-hud';
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
    <div className="min-h-screen w-full flex flex-col bg-[radial-gradient(circle,#FFFCF5_0%,#EFC18F_40%,#D68B5C_75%,#60203D_100%)]">
      <header className="sticky top-0 left-0 right-0 w-full px-2 sm:px-4 pt-2 z-20 pointer-events-none">
        <div className="pointer-events-auto flex w-full flex-col gap-2 p-1">
          <HeaderHUD className="rounded-lg" />
          <div className="flex w-full justify-end pr-1 sm:pr-2 lg:pr-4">
            <RankWidget />
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
