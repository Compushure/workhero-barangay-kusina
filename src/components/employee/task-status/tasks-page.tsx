'use client';

import { useEffect, useMemo, useState } from 'react';
import { useGetEmployeeTasks } from '@/hooks/tanstack/queries/employeeTasksQueries';
import { useGetAllLevelMetadata, useGetEmployeeXP } from '@/hooks/tanstack/queries/employeeQueries';
import { useEmployeeTasksStore } from '@/store/employee';
import HeaderHUD from '../widgets/header-hud';
import { toEmployeeTaskBoardData } from './task-status-data';
import { TaskStatusBoard } from './task-status-board';

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
          <TaskStatusBoard
            currentTasks={isLoading ? [] : tasks.currentTasks}
            inReviewTasks={isLoading ? [] : tasks.inReviewTasks}
            verifiedTasks={isLoading ? [] : tasks.verifiedTasks}
            rejectedTasks={isLoading ? [] : tasks.rejectedTasks}
            isLoading={isLoading}
            error={resolvedError}
          />
        </div>
      </main>
    </div>
  );
}
