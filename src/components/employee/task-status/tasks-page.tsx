'use client';

import { useEffect, useMemo, useState } from 'react';
import { useGetEmployeeTasks } from '@/hooks/tanstack/queries/employeeTasksQueries';
import { useGetAllLevelMetadata, useGetEmployeeXP } from '@/hooks/tanstack/queries/employeeQueries';
import { useEmployeeTasksStore } from '@/store/employee';
import { Skeleton } from '@/components/ui/skeleton';
import HeaderHUD from '../widgets/header-hud';
import { toEmployeeTaskBoardData } from './task-status-data';
import { TaskStatusBoard } from './task-status-board';

function TaskStatusBoardLoading() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border-3 border-[#47331F] bg-[#eadbc1] p-2.5 font-jersey shadow-[0_10px_28px_rgba(71,51,31,0.24)] sm:p-3">
      <div className="flex flex-col gap-2 border-b-2 border-[#d4c5a8] pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex w-full gap-2 overflow-hidden sm:w-auto">
            <Skeleton className="h-9 w-28 rounded-full bg-[#dcc8aa]" />
            <Skeleton className="h-9 w-32 rounded-full bg-[#dcc8aa]" />
            <Skeleton className="h-9 w-30 rounded-full bg-[#dcc8aa]" />
            <Skeleton className="h-9 w-30 rounded-full bg-[#dcc8aa]" />
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

      <div className="grid h-full min-h-0 grid-cols-1 gap-2.5 pt-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-3">
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
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <Skeleton className="h-6 w-44 bg-[#eadbc1]" />
                        <div className="flex items-center gap-1.5">
                          <Skeleton className="h-4 w-4 rounded-sm bg-[#eadbc1]" />
                          <Skeleton className="h-4 w-28 bg-[#eadbc1]" />
                        </div>
                      </div>
                      <div className="rounded-xl border-2 border-[#d4c5a8] bg-[#f3e4c9] px-2 py-1.5">
                        <Skeleton className="h-12 w-12 bg-[#eadbc1]" />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      <Skeleton className="h-7 w-18 rounded-md bg-[#d7e3f4]" />
                      <Skeleton className="h-7 w-16 rounded-md bg-[#eadbc1]" />
                      <Skeleton className="h-7 w-14 rounded-md bg-[#d7e3f4]" />
                      <Skeleton className="h-7 w-16 rounded-md bg-[#f4d6ce]" />
                      <Skeleton className="h-7 w-16 rounded-md bg-[#efe2ca]" />
                    </div>
                  </div>
                </div>
                <div className="w-full rounded-lg border-2 border-[#d4c5a8] bg-[#fdf5e8] px-3.5 py-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <Skeleton className="h-6 w-40 bg-[#eadbc1]" />
                        <div className="flex items-center gap-1.5">
                          <Skeleton className="h-4 w-4 rounded-sm bg-[#eadbc1]" />
                          <Skeleton className="h-4 w-24 bg-[#eadbc1]" />
                        </div>
                      </div>
                      <div className="rounded-xl border-2 border-[#d4c5a8] bg-[#f3e4c9] px-2 py-1.5">
                        <Skeleton className="h-12 w-12 bg-[#eadbc1]" />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      <Skeleton className="h-7 w-18 rounded-md bg-[#d7e3f4]" />
                      <Skeleton className="h-7 w-16 rounded-md bg-[#eadbc1]" />
                      <Skeleton className="h-7 w-14 rounded-md bg-[#d7e3f4]" />
                      <Skeleton className="h-7 w-16 rounded-md bg-[#f4d6ce]" />
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
  const { data: xpData, isLoading: isXpLoading } = useGetEmployeeXP();
  const { data: levelMetadata, isLoading: isLevelMetadataLoading } = useGetAllLevelMetadata();
  const [isBackgroundReady, setIsBackgroundReady] = useState(false);
  const tasks = useEmployeeTasksStore((state) => state.tasks);
  const hydrateFromServer = useEmployeeTasksStore((state) => state.hydrateFromServer);

  const normalizedTaskData = useMemo(() => toEmployeeTaskBoardData(data), [data]);

  useEffect(() => {
    if (data || !isLoading) {
      hydrateFromServer(normalizedTaskData);
    }
  }, [data, hydrateFromServer, isLoading, normalizedTaskData]);

  const kitchenBackgroundUrl = useMemo(() => {
    const currentLevel = xpData?.level;
    if (!currentLevel || !levelMetadata || levelMetadata.length === 0) {
      return null;
    }

    const levelRow = levelMetadata?.find((row) => row.level === currentLevel);
    const dbLink = levelRow?.bg_img_link?.trim();

    return dbLink && dbLink.length > 0 ? dbLink : null;
  }, [levelMetadata, xpData?.level]);

  useEffect(() => {
    if (!kitchenBackgroundUrl) {
      setIsBackgroundReady(false);
      return;
    }

    let isCancelled = false;
    const preloadImage = new window.Image();

    const markReady = () => {
      if (!isCancelled) {
        setIsBackgroundReady(true);
      }
    };

    setIsBackgroundReady(false);
    preloadImage.onload = markReady;
    preloadImage.onerror = markReady;
    preloadImage.src = kitchenBackgroundUrl;

    if (preloadImage.complete) {
      markReady();
    }

    return () => {
      isCancelled = true;
      preloadImage.onload = null;
      preloadImage.onerror = null;
    };
  }, [kitchenBackgroundUrl]);

  const isBackgroundMetadataLoading = isXpLoading || isLevelMetadataLoading;
  const showBackgroundSkeleton =
    isBackgroundMetadataLoading || (Boolean(kitchenBackgroundUrl) && !isBackgroundReady);

  const resolvedError = error ?? (!isLoading && !data ? new Error('Failed to load tasks') : null);

  return (
    <div className="relative isolate flex min-h-dvh w-full min-w-0 flex-col overflow-x-clip bg-[#e3bf73] font-jersey tracking-[0.08em] xl:h-dvh xl:overflow-hidden">
      {kitchenBackgroundUrl ? (
        <div
          className={`pointer-events-none fixed inset-x-0 top-0 h-dvh -z-20 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ease-out ${
            isBackgroundReady ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url('${kitchenBackgroundUrl}')` }}
          aria-hidden
        />
      ) : null}

      <div
        className={`pointer-events-none fixed inset-x-0 top-0 h-dvh -z-10 transition-opacity duration-500 ease-out ${
          showBackgroundSkeleton ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden
      >
        <div className="absolute inset-0 bg-linear-to-br from-[#f6e2a4] via-[#eac777] to-[#d8a253]" />
        <div className="absolute inset-0 animate-[pulse_1.8s_ease-in-out_infinite] bg-linear-to-r from-[#fff6d5]/0 via-[#fff6d5]/55 to-[#fff6d5]/0" />
        <div className="absolute inset-0 animate-[pulse_2.6s_ease-in-out_infinite] bg-linear-to-b from-[#f9d882]/28 via-transparent to-[#c9862f]/18" />
      </div>

      <header className="pointer-events-none sticky top-0 left-0 right-0 z-20 w-full px-2 pt-2 sm:px-4">
        <div className="pointer-events-auto flex w-full flex-col gap-2 p-1">
          <HeaderHUD className="rounded-lg" />
        </div>
      </header>

      <main className="mx-auto flex w-full min-w-0 flex-1 justify-center px-1 pb-24 pt-1 sm:px-3 sm:pb-3 sm:pt-2 md:min-h-0 md:px-4 md:pb-4 xl:overflow-hidden">
        <div className="flex w-full min-w-0 max-w-screen flex-1 md:min-h-0">
          {isLoading ? (
            <TaskStatusBoardLoading />
          ) : (
            <TaskStatusBoard
              currentTasks={tasks.currentTasks}
              inReviewTasks={tasks.inReviewTasks}
              verifiedTasks={tasks.verifiedTasks}
              rejectedTasks={tasks.rejectedTasks}
              isLoading={isLoading}
              error={resolvedError}
            />
          )}
        </div>
      </main>
    </div>
  );
}
