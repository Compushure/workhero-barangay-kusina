'use client';

import { useState } from 'react';

export default function LevelIcon() {
  const [level] = useState(3);
  const [xp] = useState(420);
  const [maxXp] = useState(999);

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Top row: Level circle + XP bar */}
      <div className="flex items-center gap-2">
        {/* Circular level icon */}
        <div className="w-8 h-8 rounded-full bg-[#fceeca] flex items-center justify-center text-[#692f03] border border-[#9d3411] font-bold text-sm">
          {level}
        </div>

        {/* XP bar */}
        <div className="w-32 h-5 bg-white border-4 border-[#9d3411] rounded-full overflow-hidden">
          <div
            className="w-full h-3 bg-linear-to-r from-yellow-400 to-orange-500 rounded-full"
            style={{ width: `${(xp / maxXp) * 100}%` }}
          />
        </div>
      </div>
      {/* XP text below bar */}
      <span className="text-xs text-muted-foreground">{xp} / {maxXp} XP</span>
    </div>
  );
}
