'use client';

import { useState } from 'react';

export default function LevelIcon() {
  const [level] = useState(3);
  const [xp] = useState(420);
  const [maxXp] = useState(999);

  return (
    <div className="flex items-center gap-4 w-full">
      {/* Level circle on the left */}
      <div className="w-16 h-16 rounded-full bg-[#fceeca] flex items-center justify-center text-[#692f03] border-2 border-[#9d3411] font-bold text-3xl shrink-0">
        {level}
      </div>

      {/* Progress bar + XP text stacked vertically */}
      <div className="flex flex-col flex-1 mt-4">
        {/* Responsive XP bar */}
        <div className="h-5 bg-white border-4 border-[#9d3411] rounded-full overflow-hidden min-w-120 max-w-2xl">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
            style={{ width: `${(xp / maxXp) * 100}%` }}
          />
        </div>

        {/* XP text directly under the bar */}
        <span className="text-sm text-muted-foreground text-left mt-1 ml-1">
          {xp} / {maxXp} XP
        </span>
      </div>
    </div>
  );
}
