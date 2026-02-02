'use client';

import { Coins } from 'lucide-react';

export default function PointsIcon() {
  return (
    <div className="flex items-center">
      {/* Coin icon overlapping the pill, smaller */}
      <div className="relative z-10 -mr-6">
        <Coins className="w-14 h-14 text-yellow-500 shrink-0" />
      </div>

      {/* Number pill, slightly smaller */}
      <div className="bg-white text-red-800 font-bold px-6 py-2 rounded-full text-xl shadow-md relative z-0 border border-yellow-300">
        99,999
      </div>
    </div>
  );
}
