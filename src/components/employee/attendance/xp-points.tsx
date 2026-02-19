'use client';

import { useEffect, useState } from 'react';
import { handleFetchEmployeeXP, handleFetchEmployeePoints } from '@/action-handlers/employees';
import type { EmployeeXP, EmployeePointsData } from '@/types';
import { XPProgressSkeleton } from './skeletons';

export default function XPProgress() {
  const [xpData, setXpData] = useState<EmployeeXP | null>(null);
  const [pointsData, setPointsData] = useState<EmployeePointsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [xp, pts] = await Promise.all([
        handleFetchEmployeeXP(),
        handleFetchEmployeePoints(),
      ]);
      setXpData(xp);
      setPointsData(pts);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    // ✅ Show skeleton while loading
    return <XPProgressSkeleton />;
  }

  const currentXP = xpData?.currentXP ?? 0;
  const maxXp = 100; // matches screenshot
  const totalPts = pointsData ? pointsData.points - pointsData.deductedPoints : 0;

  return (
    <div className="w-60 max-w-5xl bg-[#765332] rounded-lg shadow-md border-3 border-[#47331F] p-2 py-0 flex flex-col items-center">
      {/* XP text above progress bar */}
      <div className="w-full text-xl text-yellow-500 text-left">
        XP: {currentXP} / {maxXp}
      </div>

      {/* Progress bar */}
      <div className="w-full">
        <div className="h-5 bg-[#273A27] border-2 border-[#47331F] rounded-sm overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${(currentXP / maxXp) * 100}%` }}
          />
        </div>
      </div>

      {/* Points with star icon */}
      <div className="w-full flex items-center gap-2 text-xl text-yellow-500 mt-2">
        <span className="text-yellow-500">★</span>
        <span>{totalPts} pts</span>
      </div>
    </div>
  );
}
