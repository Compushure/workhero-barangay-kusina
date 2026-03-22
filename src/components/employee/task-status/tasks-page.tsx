'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useGetEmployeeTasks } from '@/hooks/tanstack/queries/employeeTasksQueries';
import { useGetAllLevelMetadata, useGetEmployeeXP } from '@/hooks/tanstack/queries/employeeQueries';
import { Skeleton } from '@/components/ui/skeleton';

const HeaderHUD = dynamic(() => import('../widgets/header-hud'), { ssr: false });
const TaskStatusBoard = dynamic(() => import('./task-status-board').then((mod) => mod.TaskStatusBoard), {
  ssr: false,
  loading: () => <TaskStatusBoardLoading />,
});

const DEFAULT_KITCHEN_BG_URL =
  'https://ewvpbwxqkomybbhmqygm.supabase.co/storage/v1/object/public/kitchen/level_1_bg.png';

function TaskStatusBoardLoading() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border-3 border-[#47331F] bg-[#eadbc1] p-2.5 font-jersey shadow-[0_10px_28px_rgba(71,51,31,0.24)] sm:p-3">
      <div className="flex flex-col gap-2 border-b-2 border-[#d4c5a8] pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-44 bg-[#dcc8aa]" />
            <Skeleton className="h-5 w-72 bg-[#eadbc1]" />
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
            <div className="w-full space-y-1 sm:w-auto">
              <Skeleton className="h-5 w-20 bg-[#dcc8aa]" />
              <Skeleton className="h-9 w-full bg-[#f7efdf] sm:w-52" />
            </div>
            <div className="flex w-full items-center gap-2 self-start sm:w-auto sm:self-end">
              <Skeleton className="h-9 w-full bg-[#f7efdf] sm:w-28" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid h-full min-h-0 grid-cols-1 gap-2.5 pt-3 md:grid-cols-2 md:grid-rows-2 xl:gap-3">
        {['Current', 'In Review', 'Approved', 'Rejected'].map((section) => (
          <div key={section} className="flex h-full min-w-0 w-full flex-col gap-2">
            <div className="flex w-full items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-28 bg-[#dcc8aa]" />
                <Skeleton className="h-8 w-10 rounded-full bg-[#f7efdf]" />
              </div>
              <Skeleton className="h-7 w-7 rounded-full bg-[#f7efdf]" />
            </div>
            <div className="flex min-h-0 flex-1 w-full flex-col overflow-hidden rounded-lg border-2 border-[#c5ac84] bg-[#f7efdf] p-2 shadow-[0_0_0_1px_rgba(155,122,86,0.2),inset_0_1px_0_rgba(255,255,255,0.35)]">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-24 w-full rounded-lg bg-[#eadbc1]" />
                <Skeleton className="h-24 w-full rounded-lg bg-[#eadbc1]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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

      <div className="mx-auto flex min-h-0 w-full flex-1 justify-center px-2 pb-2 pt-1 sm:px-3 sm:pb-3 sm:pt-2 md:px-4 md:pb-4">
        <div className="flex min-h-0 w-full max-w-[1180px] flex-1">
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
    </div>
  );
}
