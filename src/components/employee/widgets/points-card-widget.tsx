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
    <div className="flex h-14 w-40 max-w-44 items-center justify-start gap-3 rounded-lg wood-panel px-3 shadow-md font-jersey tracking-wider">
      <div className="rounded-full bg-white/20 p-1.5">
        <Coins className="h-4 w-4 text-yellow-500" />
      </div>
      <div className="flex flex-col pt-2">
        <span className="text-sm text-yellow-500 leading-2">Fiesta Points</span>
        <span className="text-2xl text-white">{totalPoints.toLocaleString()}</span>
      </div>
    </div>
  );
}
