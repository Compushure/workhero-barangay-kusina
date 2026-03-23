'use client';

import { Coins } from 'lucide-react';
import { useGetEmployeePoints } from '@/hooks/tanstack/queries/employeeQueries';
import { PointsCardWidgetSkeleton } from './widget-skeletons';

export default function PointsCardWidget() {
  const { data: pointsData, isLoading } = useGetEmployeePoints();
  const totalPoints = pointsData?.points ?? 0;

  if (isLoading) {
    return <PointsCardWidgetSkeleton />;
  }

  return (
    <div className="flex h-[clamp(2.75rem,8vw,4.25rem)] w-[clamp(8rem,50vw,10rem)] items-center justify-start gap-2 sm:gap-3 rounded-lg wood-panel px-1.5 sm:px-2 shadow-md font-jersey tracking-wider">
      <div className="rounded-full bg-white/20 p-1 sm:p-1.5">
        <Coins className="size-4 sm:size-5 text-yellow-500" />
      </div>
      <div className="flex flex-col pt-0.5 sm:pt-2 gap-0.5 min-w-0">
        <span className="text-xs sm:text-sm text-yellow-500 leading-tight whitespace-nowrap">
          Fiesta Points
        </span>
        <span className="text-lg sm:text-2xl text-white font-bold wrap-break-word">
          {totalPoints.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
