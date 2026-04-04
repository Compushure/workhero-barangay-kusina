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
    <div className="flex h-14 items-center justify-start gap-1.5 rounded-lg wood-panel px-2 shadow-md font-jersey tracking-wider sm:h-15 sm:gap-2 sm:px-2.5 w-[clamp(7rem,15vw,10rem)] md:h-16 md:w-[clamp(9.5rem,18vw,12.5rem)]">
      <div className="rounded-full bg-wood-light p-1 shadow-xs/25 sm:p-1.5">
        <Coins className="size-4 text-yellow-500 sm:size-5" />
      </div>
      <div className="flex min-w-0 flex-col justify-center sm:pb-0.5">
        <span className="hidden whitespace-nowrap text-xs leading-4 text-yellow-500 md:inline-block lg:text-sm">
          Fiesta Points
        </span>
        <span className="text-3xl font-bold leading-none tracking-wider text-white sm:text-2xl md:text-[1.85rem]">
          {totalPoints.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
