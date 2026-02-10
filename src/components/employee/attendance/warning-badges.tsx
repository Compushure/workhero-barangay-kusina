// app/components/PixelBadge.tsx
'use client';

import { ReactNode } from 'react';

interface PixelBadgeProps {
  children: ReactNode;
  color: 'red' | 'orange' | 'yellow' | 'purple' | 'blue';
}

export default function PixelBadge({ children, color }: PixelBadgeProps) {
  const colorClasses = {
    red: 'bg-red-600 text-white',
    orange: 'bg-orange-500 text-black',
    yellow: 'bg-yellow-300 text-black',
    purple: 'bg-purple-700 text-white',
    blue: 'bg-blue-500 text-white',
  };

  return (
    <span
      className={`inline-block px-3 py-1 text-[11px] font-bold 
                  border-4 border-black rounded-full shadow-[4px_4px_0px_#000] 
                  ${colorClasses[color]}`}
    >
      {children}
    </span>
  );
}
