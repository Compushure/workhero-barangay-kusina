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
    <div className="flex h-[clamp(2.75rem,8vw,4.25rem)] w-full lg:w-[clamp(8rem,50vw,10rem)] items-stretch justify-start gap-2 rounded-lg wood-panel px-1.5 shadow-md font-jersey tracking-wider sm:gap-3 sm:px-2 lg:items-center">
      <div className="flex self-center rounded-full bg-white/20 p-1 sm:p-1.5">
        <Coins className="size-4 sm:size-5 text-yellow-500" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center self-stretch gap-0 sm:gap-0.5 lg:flex-none lg:self-auto lg:pt-2">
        <span className="text-xs leading-none whitespace-nowrap text-yellow-500 sm:text-sm lg:leading-tight">
          Fiesta Points
        </span>
        <span className="text-lg leading-none text-white font-bold wrap-break-word sm:text-xl lg:text-2xl">
          {totalPoints.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
