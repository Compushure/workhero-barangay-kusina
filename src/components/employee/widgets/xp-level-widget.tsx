'use client';

import { useEffect, useState } from 'react';
import { handleFetchEmployeeXP } from '@/action-handlers/employee/stats';
import type { EmployeeXP } from '@/types';
import { XPProgressSkeleton } from './widget-skeletons';

export default function XPProgress() {
  const [xpData, setXpData] = useState<EmployeeXP | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const xp = await handleFetchEmployeeXP();
      setXpData(xp);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    // ✅ Show skeleton while loading
    return <XPProgressSkeleton />;
  }

  const currentXP = xpData?.currentXP ?? 0;
  const currentLevel = xpData?.level ?? 1;
  const maxXp = 100; // matches screenshot

  return (
    <div className="w-full sm:w-100 max-w-50 sm:max-w-50 wood-panel rounded-lg shadow-md p-2 py-0 flex flex-col items-center">
      {/* Level in place of points row */}
      <div className="w-full flex items-center gap-2 text-lg sm:text-xl text-yellow-500">
        <span className="text-sm">⭐</span>
        <span>Lvl {currentLevel}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full">
        <div className="h-4 sm:h-5 bg-[#273A27] border-2 border-[#47331F] rounded-sm overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${(currentXP / maxXp) * 100}%` }}
          />
        </div>
      </div>

      
      {/* XP text above progress bar */}
      <div className="w-full text-base sm:text-lg text-yellow-500 text-left pl-2">
        XP : {currentXP} / {maxXp}
      </div>
    </div>
  );
}
