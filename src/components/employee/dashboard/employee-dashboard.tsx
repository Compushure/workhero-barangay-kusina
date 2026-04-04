'use client';

import { useMemo, useState } from 'react';
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
      className="relative flex flex-col min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('${kitchenBackgroundUrl}')` }}
    >
      {/* Overlay top widgets (do not affect layout flow) */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 z-20 w-full px-2 pt-2 sm:px-4">
        <div className="pointer-events-none flex w-full flex-col gap-2">
          <HeaderHUD className="rounded-lg pointer-events-auto" />
          <div className="flex w-full justify-end pr-1 sm:pr-2 lg:pr-4 pointer-events-none">
            <div className="pointer-events-auto hidden lg:block">
              <RankWidget />
            </div>
          </div>
        </div>
      </div>

      {/* Preserve original vertical placement after moving HUD to overlay */}
      <div className="h-26 sm:h-28" aria-hidden="true" />

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
          <div className="flex-1 basis-0 min-w-0">
            <Card className="bg-transparent shadow-none border-none h-full">
              <CardContent className="h-full"></CardContent>
            </Card>
          </div>

          {/* Middle column: 60% */}
          <div className="flex-3 basis-0 min-w-0 flex justify-center">
            <CookingSection className="w-full h-full" />
          </div>

          <div className="flex-1 basis-0 min-w-0 flex items-start justify-start" />
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
