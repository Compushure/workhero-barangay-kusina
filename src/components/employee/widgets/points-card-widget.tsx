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
    <div className="flex h-12 items-center justify-start gap-1.5 rounded-lg wood-panel px-2 shadow-md font-jersey tracking-wider sm:h-13 sm:gap-2 sm:px-2.5 w-[clamp(6rem,12vw,8rem)] md:h-14 md:w-[clamp(10rem,16vw,12rem)]">
      <div className="rounded-full bg-wood-light p-1 shadow-xs/25 sm:p-1.5">
        <Coins className="size-4 text-yellow-500 sm:size-5" />
      </div>
      <div className="flex min-w-0 flex-col justify-center sm:pb-1">
        <span className="hidden whitespace-nowrap text-xs text-yellow-500 md:inline-block lg:text-sm">
          Fiesta Points
        </span>
        <span className="font-bold leading-5 tracking-wider text-white text-2xl md:text-[1.85rem]">
          {totalPoints.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
