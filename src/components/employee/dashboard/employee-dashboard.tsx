'use client';

import { useEffect, useMemo, useState } from 'react';
// import ProfileAndLevel from '../attendance/profile-level';
// import XPProgressAndPoints from '../attendance/xp-points';
// import NavSection from '../nav-section';
import HeaderHUD from '../widgets/header-hud';
import CookingSection from './cooking-section';
import { RankWidget } from './rank-panel';
import { RewardRequestsFeedbackModal } from './reward-requests-feedback-modal';
import TaskIcon from './quick-task';
import RewardIcon from './reward-icon';
import { Card, CardContent } from '@/components/ui/card';
import { useGetAllLevelMetadata, useGetEmployeeXP } from '@/hooks/tanstack/queries/employeeQueries';
import { useCookingStore } from '@/store/cookingStore';

export default function EmployeeDashboardClient() {
  const [isRewardFeedbackModalOpen, setIsRewardFeedbackModalOpen] = useState(false);
  const [isBackgroundReady, setIsBackgroundReady] = useState(false);
  const { data: xpData, isLoading: isXpLoading } = useGetEmployeeXP();
  const { data: levelMetadata, isLoading: isLevelMetadataLoading } = useGetAllLevelMetadata();
  const isCookingSequenceActive = useCookingStore((state) => Boolean(state.trigger));

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

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#e3bf73]">
      {kitchenBackgroundUrl ? (
        <div
          className={`pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ease-out ${
            isBackgroundReady ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url('${kitchenBackgroundUrl}')` }}
          aria-hidden
        />
      ) : null}

      <div
        className={`pointer-events-none absolute inset-0 z-1 transition-opacity duration-500 ease-out ${
          showBackgroundSkeleton ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden
      >
        <div className="absolute inset-0 bg-linear-to-br from-[#f6e5b3] via-[#f9cb5e] to-[#c7831d]" />
        <div className="absolute inset-0 animate-[pulse_1.8s_ease-in-out_infinite] bg-linear-to-r from-[#fff6d5]/0 via-[#fff6d5]/55 to-[#fff6d5]/0" />
        <div className="absolute inset-0 animate-[pulse_2.6s_ease-in-out_infinite] bg-linear-to-b from-[#f9d882]/28 via-transparent to-[#c9862f]/18" />
      </div>

      <div className="pointer-events-none absolute top-0 left-0 right-0 z-49 w-full px-2 pt-2 sm:px-4">
        <HeaderHUD className="rounded-lg pointer-events-auto" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Keep rank in the main dashboard layer so dialogs can still dim it. */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 w-full px-2 pt-18 sm:px-4">
          <div className="pointer-events-none flex w-full justify-end pr-0.5 sm:pr-1 lg:pr-2">
            <div className="pointer-events-auto hidden lg:block">
              <RankWidget />
            </div>
          </div>
        </div>

        <div className="h-26 sm:h-28" aria-hidden="true" />

        <section className="relative flex h-87 flex-none gap-4 p-4">
          {/* Background image layer only for Row 2 */}
          <div
            className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-60"
            style={{ backgroundImage: `url('/window.png')` }}
          />

          {/* Foreground content */}
          <div className="relative z-10 flex w-full gap-4">
            {/* Left column: 20% */}
            <div className="min-w-0 flex-1 basis-0">
              <Card className="h-full border-none bg-transparent shadow-none">
                <CardContent className="h-full"></CardContent>
              </Card>
            </div>

            {/* Middle column: 60% */}
            <div className="min-w-0 flex-3 basis-0 justify-center flex">
              <CookingSection className="w-full h-full" />
            </div>

            <div className="min-w-0 flex-1 basis-0 flex items-start justify-start" />
          </div>
        </section>

        {/* Row 3: Tasks and reward feedback triggers */}
        <section className="flex justify-center px-4 pb-4 pt-10">
          <div className="flex items-center gap-6">
            <TaskIcon disabled={isCookingSequenceActive} />
            <RewardIcon
              disabled={isCookingSequenceActive}
              onOpen={() => setIsRewardFeedbackModalOpen(true)}
            />
          </div>
        </section>

        <RewardRequestsFeedbackModal
          open={isRewardFeedbackModalOpen}
          onOpenChange={setIsRewardFeedbackModalOpen}
        />
      </div>
    </div>
  );
}
