'use client';

import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useGetEmployeeTasks } from '@/hooks/tanstack/queries/employeeTasksQueries';
import { useGetAllLevelMetadata, useGetEmployeeXP } from '@/hooks/tanstack/queries/employeeQueries';
import { useEmployeeTasksStore } from '@/store/employee';
import { Skeleton } from '@/components/ui/skeleton';
import { PointsCardWidgetSkeleton, XPProgressSkeleton } from '../widgets/widget-skeletons';
import { toEmployeeTaskBoardData } from './task-status-data';

const HeaderHUD = dynamic(() => import('../widgets/header-hud'), {
  ssr: false,
  loading: () => <HeaderHUDLoading />,
});
const TaskStatusBoard = dynamic(
  () => import('./task-status-board').then((mod) => mod.TaskStatusBoard),
  {
    ssr: false,
    loading: () => <TaskStatusBoardLoading />,
  }
);

const DEFAULT_KITCHEN_BG_URL =
  'https://ewvpbwxqkomybbhmqygm.supabase.co/storage/v1/object/public/kitchen/level_1_bg.png';

function HeaderHUDLoading() {
  return (
    <div className="flex min-h-16 w-full items-center justify-start gap-2 overflow-x-hidden px-2 pr-14 sm:gap-2.5 sm:pl-2 sm:pr-16 md:pr-20">
      <div className="min-w-0 flex-[1.3] font-jersey md:min-w-fit md:flex-none">
        <XPProgressSkeleton />
      </div>

      <div className="min-w-0 flex-1 font-jersey md:min-w-fit md:flex-none">
        <PointsCardWidgetSkeleton />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <Skeleton className="size-12 rounded-full bg-[#8a6039]/65" />
        <Skeleton className="size-12 rounded-full bg-[#8a6039]/65" />
        <Skeleton className="size-12 rounded-full bg-[#8a6039]/65" />
      </div>
    </div>
  );
}

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

      <div className="grid h-full min-h-0 grid-cols-1 gap-2.5 pt-3 lg:grid-cols-2 lg:grid-rows-2 xl:gap-3">
        {['Current', 'In Review', 'Approved', 'Rejected'].map((section) => (
          <div key={section} className="flex h-full min-w-0 w-full flex-col gap-2">
            <div className="flex w-full items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-28 bg-[#dcc8aa]" />
                <Skeleton className="h-8 w-10 rounded-full bg-[#f7efdf]" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-full bg-[#f7efdf]" />
                <Skeleton className="h-7 w-7 rounded-full bg-[#f7efdf]" />
              </div>
            </div>
            <div className="flex min-h-0 flex-1 w-full flex-col overflow-hidden rounded-lg border-2 border-[#c5ac84] bg-[#f7efdf] p-2 shadow-[0_0_0_1px_rgba(155,122,86,0.2),inset_0_1px_0_rgba(255,255,255,0.35)]">
              <div className="flex flex-col gap-2">
                <div className="w-full rounded-lg border-2 border-[#d4c5a8] bg-[#fdf5e8] px-3.5 py-3">
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-6 w-40 bg-[#eadbc1]" />
                        <div className="flex items-center gap-1.5">
                          <Skeleton className="h-5 w-5 rounded-sm bg-[#eadbc1]" />
                          <Skeleton className="h-4 w-32 bg-[#eadbc1]" />
                        </div>
                      </div>
                      <div className="rounded-xl border-2 border-[#d4c5a8] bg-[#f3e4c9] px-2 py-1.5">
                        <Skeleton className="h-12 w-12 bg-[#eadbc1]" />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Skeleton className="h-7 w-22 rounded-md bg-[#eadbc1]" />
                      <Skeleton className="h-7 w-16 rounded-md bg-[#d7e3f4]" />
                      <Skeleton className="h-7 w-22 rounded-md bg-[#eadbc1]" />
                      <Skeleton className="h-7 w-22 rounded-md bg-[#eadbc1]" />
                    </div>
                  </div>
                </div>
                <div className="w-full rounded-lg border-2 border-[#d4c5a8] bg-[#fdf5e8] px-3.5 py-3">
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-6 w-36 bg-[#eadbc1]" />
                        <div className="flex items-center gap-1.5">
                          <Skeleton className="h-5 w-5 rounded-sm bg-[#eadbc1]" />
                          <Skeleton className="h-4 w-30 bg-[#eadbc1]" />
                        </div>
                      </div>
                      <div className="rounded-xl border-2 border-[#d4c5a8] bg-[#f3e4c9] px-2 py-1.5">
                        <Skeleton className="h-12 w-12 bg-[#eadbc1]" />
                      </div>
                    </div>
                  </div>
                </div>
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
  const tasks = useEmployeeTasksStore((state) => state.tasks);
  const hydrateFromServer = useEmployeeTasksStore((state) => state.hydrateFromServer);

  const normalizedTaskData = useMemo(() => toEmployeeTaskBoardData(data), [data]);

  useEffect(() => {
    if (data || !isLoading) {
      hydrateFromServer(normalizedTaskData);
    }
  }, [data, hydrateFromServer, isLoading, normalizedTaskData]);

  const kitchenBackgroundUrl = useMemo(() => {
    const currentLevel = xpData?.level ?? 1;
    const levelRow = levelMetadata?.find((row) => row.level === currentLevel);
    const dbLink = levelRow?.bg_img_link?.trim();

    return dbLink && dbLink.length > 0 ? dbLink : DEFAULT_KITCHEN_BG_URL;
  }, [levelMetadata, xpData?.level]);

  const resolvedError = error ?? (!isLoading && !data ? new Error('Failed to load tasks') : null);

  return (
    <div className="relative isolate flex min-h-[100dvh] w-full min-w-0 flex-col overflow-x-clip font-jersey tracking-[0.08em]">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${kitchenBackgroundUrl}')` }}
        aria-hidden
      />

      <header className="pointer-events-none sticky top-0 left-0 right-0 z-20 w-full px-2 pt-2 sm:px-4">
        <div className="pointer-events-auto flex w-full flex-col gap-2 p-1">
          <HeaderHUD className="rounded-lg" />
        </div>
      </header>

      <main className="mx-auto flex w-full min-w-0 flex-1 justify-center px-2 pb-3 pt-1 sm:px-3 sm:pb-3 sm:pt-2 md:min-h-0 md:px-4 md:pb-4">
        <div className="flex w-full min-w-0 max-w-[1180px] flex-1 md:min-h-0">
          <TaskStatusBoard
            currentTasks={tasks.currentTasks}
            inReviewTasks={tasks.inReviewTasks}
            verifiedTasks={tasks.verifiedTasks}
            rejectedTasks={tasks.rejectedTasks}
            isLoading={isLoading}
            error={resolvedError}
          />
        </div>
      </main>
    </div>
  );
}
