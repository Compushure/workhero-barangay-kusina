'use client';

import { useGetEmployeeXP, useGetEmployeePoints, useGetXPRequiredForNextLevel } from '@/hooks/tanstack/queries/employeeQueries';
import type { EmployeeXP, EmployeePointsData } from '@/types';
import { XPProgressSkeleton } from './skeletons';

export default function XPProgress() {
  const { data: xpData, isLoading: xpLoading } = useGetEmployeeXP();
  const { data: pointsData, isLoading: pointsLoading } = useGetEmployeePoints();
  const { data: requiredXP, isLoading: requiredLoading } = useGetXPRequiredForNextLevel(
    xpData?.level ?? 1
  );

  const loading = xpLoading || pointsLoading || requiredLoading;

  if (loading) {
    return <XPProgressSkeleton />;
  }

  const currentXP = xpData?.currentXP ?? 0;
  const nextLevelXP = requiredXP ?? 100;
  const progressPercent =
    nextLevelXP > 0 ? Math.min((currentXP / nextLevelXP) * 100, 100) : 0;
  const totalPts = pointsData?.points ?? 0;

  return (
    <div className="w-full sm:w-100 max-w-[200px] sm:max-w-[200px] font-jersey tracking-widest bg-[#765332] rounded-lg shadow-md border-3 border-[#47331F] p-2 py-0 flex flex-col items-center">
      {/* XP text above progress bar */}
      <div className="w-full text-lg sm:text-xl text-yellow-500 text-left leading-none">
        XP: {currentXP} / {nextLevelXP}
      </div>

      {/* Progress bar */}
      <div className="w-full">
        <div className="h-4 sm:h-5 bg-[#273A27] border-2 border-[#47331F] rounded-sm overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Points with star icon */}
      <div className="w-full flex items-center gap-2 text-lg sm:text-xl text-yellow-500 leading-none">
        <span className="text-sm">⭐</span>
        <span>{totalPts} pts</span>
      </div>
    </div>
  );
}
