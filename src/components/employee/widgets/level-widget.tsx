// OUTDATED COMPONENT - not in use anymore

'use client';

import { useGetEmployeeXP, useGetXPRequiredForNextLevel } from '@/hooks/tanstack';

export default function LevelIcon() {
  const { data: xpData } = useGetEmployeeXP();
  const currentLevel = xpData?.level ?? 1;
  const { data: requiredXP } = useGetXPRequiredForNextLevel(currentLevel);

  const level = xpData?.level ?? 0;
  const currentXP = xpData?.currentXP ?? 0;
  const totalCurrentXP = xpData?.totalXP ?? 0;
  const nextLevelXP = requiredXP ?? 100;
  const thresholdTotalXP =
    currentLevel >= 10
      ? totalCurrentXP
      : Math.max(totalCurrentXP - currentXP + nextLevelXP, 1);
  const progressPercent =
    thresholdTotalXP > 0 ? Math.min((totalCurrentXP / thresholdTotalXP) * 100, 100) : 0;

  return (
    <div className="flex items-center gap-4 w-full">
      {/* Level circle on the left */}
      <div className="w-16 h-16 rounded-full bg-[#fceeca] flex items-center justify-center text-[#692f03] border-2 border-[#9d3411] font-bold text-3xl shrink-0">
        {level}
      </div>

      {/* Progress bar + XP text stacked vertically */}
      <div className="flex flex-col flex-1 mt-4">
        {/* Responsive XP bar */}
        <div className="h-5 bg-white border-4 border-[#9d3411] rounded-full overflow-hidden min-w-120z max-w-2xl">
          <div
            className="h-full bg-linear-to-r from-yellow-400 to-orange-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* XP text directly under the bar */}
        <span className="text-sm text-muted-foreground text-left mt-1 ml-1">
          {totalCurrentXP} / {thresholdTotalXP} XP
        </span>
      </div>
    </div>
  );
}
