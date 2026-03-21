'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import ProfileAndLevel from '../attendance/profile-level';
import XPProgressAndPoints from '../attendance/xp-points';
import NavSection from '../nav-section';
import CookingSection from './cooking-section';
import { RankWidget } from './rank-panel';
import { RewardRequestsFeedbackModal } from './reward-requests-feedback-modal';
import TaskIcon from './quick-task';
import RewardIcon from './reward-icon';
import { Card, CardContent } from '@/components/ui/card';
import { useGetAllLevelMetadata, useGetEmployeeXP } from '@/hooks/tanstack/queries/employeeQueries';

const DEFAULT_KITCHEN_BG_URL =
  'https://ewvpbwxqkomybbhmqygm.supabase.co/storage/v1/object/public/kitchen/level_1_bg.png';

export default function EmployeeDashboardClient() {
  const [isRewardFeedbackModalOpen, setIsRewardFeedbackModalOpen] = useState(false);
  const { data: xpData } = useGetEmployeeXP();
  const { data: levelMetadata } = useGetAllLevelMetadata();

  const kitchenBackgroundUrl = useMemo(() => {
    const currentLevel = xpData?.level ?? 1;
    const levelRow = levelMetadata?.find((row) => row.level === currentLevel);
    const dbLink = levelRow?.bg_img_link?.trim();

    // Fallback only when DB link is empty/null.
    return dbLink && dbLink.length > 0 ? dbLink : DEFAULT_KITCHEN_BG_URL;
  }, [levelMetadata, xpData?.level]);

  return (
    <div
      className="flex flex-col min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('${kitchenBackgroundUrl}')` }}
    >
      {/* Row 1: Header HUD */}
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

      {/* Row 2: Nav (20%) + Cooking (60%) + Rank (20%) */}
      <section className="relative flex gap-4 p-4 flex-none h-87">
        {/* Background image layer only for Row 2 */}
        <div
          className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-60"
          style={{ backgroundImage: `url('/window.png')` }}
        />

        {/* Foreground content */}
        <div className="relative z-10 flex gap-4 w-full">
          {/* Left column: 20% */}
          <div className="w-[20%]">
            <Card className="bg-transparent shadow-none border-none h-full">
              <CardContent className="h-full">
                
              </CardContent>
            </Card>
          </div>

          {/* Middle column: 60% */}
          <div className="w-[60%] flex">
            <CookingSection className="w-full h-full" />
          </div>

          <div className="w-[20%] min-w-70 flex items-start justify-start" />
        </div>
      </section>

      {/* Row 3: Tasks and reward feedback triggers */}
      <section className="flex px-4 pb-4 pt-10 justify-center">
        <div className="flex items-center gap-6">
        <TaskIcon />
          <RewardIcon onOpen={() => setIsRewardFeedbackModalOpen(true)} />
        </div>
      </section>

      <RewardRequestsFeedbackModal
        open={isRewardFeedbackModalOpen}
        onOpenChange={setIsRewardFeedbackModalOpen}
      />
    </div>
  );
}
