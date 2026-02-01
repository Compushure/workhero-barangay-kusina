'use client';

import { Coins } from 'lucide-react';

export default function PointsIcon() {
  return (
    <div className="relative flex items-center">
      {/* Background pill with number */}
      <div className="bg-yellow-100 text-yellow-800 font-bold px-6 py-1 rounded-full text-sm">
        99,999
      </div>

      {/* Overlapping two-coins icon */}
      <div className="absolute -left-3">
        <Coins className="w-7 h-7 text-yellow-500" />
      </div>
    </div>
  );
}
